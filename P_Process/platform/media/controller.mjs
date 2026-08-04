import { validateMedia } from './contracts.mjs';

export function createMediaController({load, view, locale, emit}) {
  let model = null;
  let opened = false;
  let pending = null;
  locale.subscribe(language => { if (model) view.render(model, language); });

  const ensureLoaded = async () => {
    if (model) return true;
    if (!pending) pending = load().then(source => {
      const result = validateMedia(source);
      if (!result.ok) {
        view.showFailure('MEDIA_DATA_INVALID');
        emit('load-media','rejected',result.code);
        return false;
      }
      model = result.value;
      view.render(model, locale.get());
      emit('load-media','accepted');
      return true;
    }).catch(() => {
      view.showFailure('MEDIA_UNAVAILABLE');
      emit('load-media','rejected','MEDIA_UNAVAILABLE');
      return false;
    });
    return pending;
  };

  const open = async () => {
    if (!await ensureLoaded()) return false;
    opened = true;
    view.setExpanded(true);
    emit('toggle-media','accepted','OPEN');
    return true;
  };
  const close = () => {
    opened = false;
    view.setExpanded(false);
    emit('toggle-media','accepted','CLOSED');
    return true;
  };
  return {open, close, isOpen:()=>opened, toggle:()=>opened ? Promise.resolve(close()) : open()};
}
