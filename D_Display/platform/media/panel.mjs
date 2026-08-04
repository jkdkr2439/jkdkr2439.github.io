const node = (tag, cls, value='') => {
  const item = document.createElement(tag);
  item.className = cls;
  item.textContent = value;
  return item;
};

export function createMediaPanel(root) {
  root.hidden = true;
  return {
    render(model, language) {
      const header = node('header','media-header');
      const heading = node('h2','media-heading',model.heading[language]);
      const description = node('p','media-description',model.description[language]);
      header.append(heading,description);
      const list = node('div','media-playlists');
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
      const channel=node('a','media-channel',model.channel.label[language]);
      channel.href=model.channel.url; channel.target='_blank'; channel.rel='noopener noreferrer';
      root.replaceChildren(header,list,channel);
    },
    setExpanded(value) { root.hidden=!value; },
    showFailure(code) { root.hidden=false; root.replaceChildren(node('p','module-failure',code)); },
  };
}
