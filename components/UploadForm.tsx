"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { categories } from "@/lib/data";
import { slugify } from "@/lib/photos";

export default function UploadForm() {
  const router = useRouter();
  const [files,setFiles] = useState<File[]>([]); const [previews,setPreviews] = useState<string[]>([]);
  const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  function pick(e:ChangeEvent<HTMLInputElement>){
    const selected=[...(e.target.files||[])].slice(0,10);
    const tooLarge=selected.find(file=>file.size>25*1024*1024);
    if(tooLarge){setError(`${tooLarge.name} is larger than 25 MB.`);setFiles([]);setPreviews([]);return;}
    setError("");setFiles(selected);setPreviews(selected.map(URL.createObjectURL));
  }
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault(); setError(""); if(!files.length){setError("Choose at least one image.");return;} setBusy(true);
    const f=new FormData(e.currentTarget); const supabase=createBrowserSupabaseClient();
    try {
      const {data:{user}}=await supabase.auth.getUser(); if(!user) throw new Error("Sign in before publishing.");
      const username=String(user.user_metadata.username||user.email?.split("@")[0]||`user-${user.id.slice(0,8)}`).toLowerCase();
      const displayName=String(user.user_metadata.display_name||username);
      const {error:profileError}=await supabase.from("profiles").upsert({
        id:user.id,username,display_name:displayName,
        bio:user.user_metadata.bio||null,avatar_url:user.user_metadata.avatar_url||null,
        location:user.user_metadata.location||null,website:user.user_metadata.website||null,
        updated_at:new Date().toISOString(),
      });
      if(profileError)throw new Error(profileError.code==="42P01"?"The Supabase database setup is incomplete. Run 001_profiles.sql and 002_complete_mvp.sql in the SQL Editor.":`Profile setup failed: ${profileError.message}`);
      const cameraName=String(f.get("camera")||"").trim(), lensName=String(f.get("lens")||"").trim();
      let cameraId:null|string=null,lensId:null|string=null;
      if(cameraName){const {data,error}=await supabase.from("cameras").upsert({name:cameraName,slug:slugify(cameraName),manufacturer:cameraName.split(" ")[0]},{onConflict:"slug"}).select("id").single();if(error)throw error;cameraId=data.id;}
      if(lensName){const {data,error}=await supabase.from("lenses").upsert({name:lensName,slug:slugify(lensName),manufacturer:lensName.split(" ")[0]},{onConflict:"slug"}).select("id").single();if(error)throw error;lensId=data.id;}
      const tags=String(f.get("hashtags")||"").split(/[\s,]+/).map(x=>x.replace(/^#/,"").toLowerCase()).filter(Boolean);
      const {data:post,error:postError}=await supabase.from("posts").insert({owner_id:user.id,caption:String(f.get("caption")||""),location:String(f.get("location")||"")||null,visibility:f.get("visibility"),camera_id:cameraId,lens_id:lensId,focal_length:String(f.get("focal")||"")||null,aperture:String(f.get("aperture")||"")||null,shutter_speed:String(f.get("shutter")||"")||null,iso:Number(f.get("iso"))||null,hashtags:tags}).select("id").single();
      if(postError)throw postError;
      const uploaded:string[]=[];
      try {
        for(let i=0;i<files.length;i++){const file=files[i];const path=`${user.id}/${post.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,"-")}`;const {error}=await supabase.storage.from("photos").upload(path,file,{contentType:file.type,upsert:false});if(error)throw error;uploaded.push(path);const dim=await dimensions(file);const {error:imgError}=await supabase.from("post_images").insert({post_id:post.id,storage_path:path,alt_text:String(f.get("altText")||"")||null,position:i,...dim});if(imgError)throw imgError;}
        const category=String(f.get("category"));const {data:cat}=await supabase.from("categories").select("id").eq("slug",slugify(category)).maybeSingle();if(cat)await supabase.from("post_categories").insert({post_id:post.id,category_id:cat.id});
        const recipeName=String(f.get("recipeName")||"").trim();if(recipeName||f.get("filmSimulation")||f.get("recipeNotes")){await supabase.from("recipes").insert({post_id:post.id,name:recipeName||null,film_simulation:String(f.get("filmSimulation")||"")||null,notes:String(f.get("recipeNotes")||"")||null,fields:{white_balance:String(f.get("whiteBalance")||"")}});}
      } catch(inner){await Promise.all(uploaded.map(path=>supabase.storage.from("photos").remove([path])));await supabase.from("posts").delete().eq("id",post.id);throw inner;}
      router.push(`/photo/${post.id}`);router.refresh();
    } catch(caught){setError(readError(caught));setBusy(false);}
  }
  return <form className="formCard wideForm" onSubmit={submit}>
    {error&&<div className="formMessage formError" role="alert">{error}</div>}
    <label className="uploadDrop"><input className="srOnly" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={pick}/><div><div style={{fontSize:34}}>＋</div><h2>{files.length?`${files.length} photo${files.length>1?"s":""} selected`:"Choose photos"}</h2><p className="muted">JPEG, PNG, WebP or HEIC · up to 10 images · 25MB each</p><span className="secondary">Browse files</span></div></label>
    {previews.length>0&&<div className="previewStrip">{previews.map((src,i)=><img src={src} alt="Selected preview" key={src+i}/>)}</div>}
    <div className="notice">EXIF fields can be verified below. Camera and lens names are normalized into searchable gear records.</div>
    <div className="twoCol" style={{marginTop:18}}><Field name="camera" label="Camera" placeholder="e.g. Fujifilm X-T1"/><Field name="lens" label="Lens" placeholder="e.g. Fujinon XF 35mm f/1.4 R"/></div>
    <div className="fourCol"><Field name="focal" label="Focal length" placeholder="35mm"/><Field name="aperture" label="Aperture" placeholder="f/2"/><Field name="shutter" label="Shutter" placeholder="1/250"/><Field name="iso" label="ISO" type="number" placeholder="400"/></div>
    <div className="field"><label>Caption</label><textarea name="caption" rows={4} placeholder="Tell the story behind the image"/></div>
    <div className="field"><label>Alt text</label><input name="altText" placeholder="Describe the photograph for screen-reader users"/></div>
    <div className="twoCol"><div className="field"><label>Category</label><select name="category">{categories.map(x=><option key={x}>{x}</option>)}</select></div><Field name="location" label="Location" placeholder="Optional"/></div>
    <div className="field"><label>Hashtags</label><input name="hashtags" placeholder="#street #fujifilm"/></div>
    <div className="twoCol"><Field name="recipeName" label="Recipe name" placeholder="Classic Chrome City"/><Field name="filmSimulation" label="Film simulation / profile" placeholder="Classic Chrome"/></div>
    <Field name="whiteBalance" label="White balance" placeholder="Daylight / 5200K"/>
    <div className="field"><label>Recipe notes</label><textarea name="recipeNotes" rows={3} placeholder="WB shift, highlights, shadows, color, editing notes..."/></div>
    <div className="field"><label>Visibility</label><select name="visibility"><option value="public">Public — visible to everyone</option><option value="private">Private — only visible to you</option></select></div>
    <button className="primary" disabled={busy}>{busy?"Publishing…":"Publish post"}</button>
  </form>;
}
function Field({name,label,...props}:{name:string;label:string;[key:string]:any}){return <div className="field"><label htmlFor={name}>{label}</label><input id={name} name={name} {...props}/></div>}
function dimensions(file:File){return new Promise<{width?:number;height?:number}>((resolve)=>{const img=new Image();const src=URL.createObjectURL(file);img.onload=()=>{URL.revokeObjectURL(src);resolve({width:img.naturalWidth,height:img.naturalHeight})};img.onerror=()=>{URL.revokeObjectURL(src);resolve({})};img.src=src;});}
function readError(value:unknown){if(value instanceof Error)return value.message;if(value&&typeof value==="object"&&"message" in value&&typeof value.message==="string")return value.message;return "Upload failed. Confirm both Supabase migrations ran successfully and try again.";}
