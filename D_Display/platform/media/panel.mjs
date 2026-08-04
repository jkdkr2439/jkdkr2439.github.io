const node = (tag, cls, value='') => {
  const item = document.createElement(tag);
  item.className = cls;
  item.textContent = value;
  return item;
};

export function createMediaPanel(root) {
  root.hidden = false;
  return {
    render(model, language) {
      const list = node('div','media-playlists');
      list.setAttribute('aria-label',model.heading[language]);
      model.playlists.forEach((item,index) => {
        const link = node('a','media-playlist');
        link.href=item.url; link.target='_blank'; link.rel='noopener noreferrer';
        const imageWrap=node('span','media-thumbnail');
        const image=document.createElement('img'); image.src=`/canvas/${item.thumbnail}`; image.alt=''; image.loading='lazy';
        imageWrap.append(image,node('span','media-play','▶'));
        const caption=node('span','media-caption');
        caption.append(node('span','media-number',String(index+1).padStart(2,'0')),node('span','media-name',item.name[language]),node('span','media-arrow','↗'));
        link.append(imageWrap,caption); list.append(link);
      });
      root.replaceChildren(list);
    },
    setExpanded(value) { root.hidden=!value; },
    showFailure(code) { root.hidden=false; root.replaceChildren(node('p','module-failure',code)); },
  };
}
