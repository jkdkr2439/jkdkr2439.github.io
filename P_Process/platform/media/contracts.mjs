const text = value => typeof value === 'string' && value.trim().length > 0;
const copy = value => text(value?.vi) && text(value?.en);
const youtube = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname);
  } catch { return false; }
};
const thumbnail = value => text(value) && !value.includes('..') && /^D_Data\/media\/assets\/images\/youtube-playlists\/[a-z0-9-]+\.jpg$/.test(value);
const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export function validateMedia(source) {
  if (!copy(source?.heading) || !copy(source?.description) || !copy(source?.channel?.label)) return {ok:false, code:'INVALID_MEDIA_COPY'};
  if (!youtube(source.channel.url)) return {ok:false, code:'INVALID_MEDIA_URL'};
  if (!Array.isArray(source.playlists) || source.playlists.length === 0) return {ok:false, code:'INVALID_MEDIA_PLAYLISTS'};
  const ids = new Set();
  for (const item of source.playlists) {
    if (!text(item?.id)) return {ok:false, code:'INVALID_MEDIA_ID'};
    if (ids.has(item.id)) return {ok:false, code:'DUPLICATE_MEDIA_ID'};
    ids.add(item.id);
    if (!youtube(item.url)) return {ok:false, code:'INVALID_MEDIA_URL'};
    if (!thumbnail(item.thumbnail)) return {ok:false, code:'INVALID_MEDIA_THUMBNAIL'};
    if (!copy(item.name)) return {ok:false, code:'INVALID_MEDIA_COPY'};
  }
  return {ok:true, value:freeze(structuredClone(source))};
}
