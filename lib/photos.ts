import type { SupabaseClient } from "@supabase/supabase-js";
import type { Photo } from "@/lib/data";

const select = `id,owner_id,caption,location,visibility,focal_length,aperture,shutter_speed,iso,created_at,
  profile:profiles!posts_owner_id_fkey(id,username,display_name,avatar_url),
  camera:cameras(id,name,slug,manufacturer),lens:lenses(id,name,slug,manufacturer),
  post_images(id,storage_path,alt_text,width,height,position),
  recipes(id,name,film_simulation,notes,fields),
  post_categories(categories(name,slug)),likes(count),saved_posts(count)`;

function one(value: unknown): Record<string, any> | null {
  if (Array.isArray(value)) return (value[0] as Record<string, any>) || null;
  return value && typeof value === "object" ? value as Record<string, any> : null;
}

export async function mapPost(supabase: SupabaseClient, row: Record<string, any>): Promise<Photo | null> {
  const image = [...(row.post_images || [])].sort((a, b) => a.position - b.position)[0];
  if (!image) return null;
  const ordered = [...(row.post_images || [])].sort((a, b) => a.position - b.position);
  const { data } = await supabase.storage.from("photos").createSignedUrls(ordered.map(item => item.storage_path), 3600);
  if (!data?.[0]?.signedUrl) return null;
  const images = ordered.map((item,index)=>({src:data[index]?.signedUrl||"",alt:item.alt_text||row.caption||"Photograph",width:item.width,height:item.height})).filter(item=>item.src);
  const profile = one(row.profile) || {};
  const camera = one(row.camera) || {};
  const lens = one(row.lens) || {};
  const recipe = one(row.recipes);
  const category = one(one(row.post_categories)?.categories)?.name || "Uncategorized";
  const initials = String(profile.display_name || profile.username || "?").split(/\s+/).slice(0,2).map((x:string)=>x[0]?.toUpperCase()).join("");
  const ratio = image.width && image.height ? image.width / image.height : 1.3;
  return {
    id: row.id, src: data[0].signedUrl, alt: image.alt_text || row.caption || "Photograph", images,
    caption: row.caption || "", ownerId: row.owner_id, visibility: row.visibility,
    user: { username: profile.username || "photographer", name: profile.display_name || profile.username || "Photographer", avatar: initials },
    camera: { slug: camera.slug || "unknown-camera", name: camera.name || "Camera not listed", maker: camera.manufacturer || "" },
    lens: { slug: lens.slug || "unknown-lens", name: lens.name || "Lens not listed" },
    category, location: row.location || "", settings: [row.focal_length,row.aperture,row.shutter_speed,row.iso ? `ISO ${row.iso}` : ""].filter(Boolean).join(" · "),
    recipe: recipe ? { name: recipe.name || "Untitled recipe", fields: Object.entries(recipe.fields || {}).map(([k,v])=>[k,String(v)] as [string,string]) } : undefined,
    recipeId: recipe?.id, likes: row.likes?.[0]?.count || 0, saves: row.saved_posts?.[0]?.count || 0,
    aspect: ratio < .9 ? "portrait" : ratio > 1.1 ? "landscape" : "square", createdAt: row.created_at,
  };
}

export async function getPosts(supabase: SupabaseClient, options: { ownerId?: string; cameraSlug?: string; lensSlug?: string; categorySlug?: string; followingIds?: string[]; limit?: number } = {}) {
  let query = supabase.from("posts").select(select).order("created_at", { ascending: false }).limit(options.limit || 40);
  if (options.ownerId) query = query.eq("owner_id", options.ownerId);
  if (options.followingIds) query = query.in("owner_id", options.followingIds.length ? options.followingIds : ["00000000-0000-0000-0000-000000000000"]);
  if (options.cameraSlug) { const {data}=await supabase.from("cameras").select("id").eq("slug",options.cameraSlug).maybeSingle(); if(!data)return []; query=query.eq("camera_id",data.id); }
  if (options.lensSlug) { const {data}=await supabase.from("lenses").select("id").eq("slug",options.lensSlug).maybeSingle(); if(!data)return []; query=query.eq("lens_id",data.id); }
  const {data:{user}}=await supabase.auth.getUser();
  if(user){const {data:blocks}=await supabase.from("blocks").select("blocked_id").eq("blocker_id",user.id);const ids=(blocks||[]).map(x=>x.blocked_id);if(ids.length)query=query.not("owner_id","in",`(${ids.join(',')})`);}
  const { data, error } = await query;
  if (error || !data) return [];
  const mapped = await Promise.all((data as Record<string, any>[]).map(row => mapPost(supabase, row)));
  let posts = mapped.filter(Boolean) as Photo[];
  if (options.categorySlug) posts = posts.filter(p => p.category.toLowerCase().replaceAll(" ", "-") === options.categorySlug);
  return posts;
}

export async function getPost(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("posts").select(select).eq("id", id).maybeSingle();
  return error || !data ? null : mapPost(supabase, data as Record<string, any>);
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "unknown";
}
