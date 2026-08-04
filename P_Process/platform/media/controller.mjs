import { validateMedia } from './contracts.mjs';

export function createMediaController({load, view, locale, emit}) {
  let model = null;
  let mounted = false;
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

  const mount = async () => {
    if (!await ensureLoaded()) return false;
    if (mounted) return true;
    mounted = true;
    view.setExpanded(true);
    emit('mount-media','accepted');
    return true;
  };
  return {mount};
}
