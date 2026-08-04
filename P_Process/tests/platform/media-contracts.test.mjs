import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateMedia } from '../../platform/media/contracts.mjs';

test('accepts the canonical four-playlist Media payload', async () => {
  const payload = JSON.parse(await readFile('D_Data/platform/media/playlists.json', 'utf8'));
  const result = validateMedia(payload);
  assert.equal(result.ok, true);
  assert.equal(result.value.playlists.length, 4);
  assert.equal(result.value.playlists[0].id, 'playlist-01');
  assert.equal(Object.isFrozen(result.value), true);
});

test('rejects duplicate ids and unsafe URLs or thumbnail paths', () => {
  const record = {
    id: 'playlist-01',
    url: 'https://www.youtube.com/watch?v=one',
    thumbnail: 'D_Data/media/assets/images/youtube-playlists/playlist-01.jpg',
    name: {vi: 'Một', en: 'One'},
  };
  const base = {
    heading: {vi: 'Danh sách nghe', en: 'Listening list'},
    description: {vi: 'Chọn một tuyển tập.', en: 'Choose a collection.'},
    channel: {url: 'https://www.youtube.com/@danhnghiahe', label: {vi: 'Mở kênh', en: 'Open channel'}},
    playlists: [record],
  };
  assert.equal(validateMedia({...base, playlists: [record, {...record}]}).code, 'DUPLICATE_MEDIA_ID');
  assert.equal(validateMedia({...base, playlists: [{...record, url: 'http://evil.test/video'}]}).code, 'INVALID_MEDIA_URL');
  assert.equal(validateMedia({...base, playlists: [{...record, thumbnail: '../secret.jpg'}]}).code, 'INVALID_MEDIA_THUMBNAIL');
  assert.equal(validateMedia({...base, playlists: [{...record, name: {vi: 'Một'}}]}).code, 'INVALID_MEDIA_COPY');
});
