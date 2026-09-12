"""Extractor para hilos y archivos de 4chan / 4channel (plugin de yt-dlp).

Este paquete (yt_dlp_plugins) se auto-descubre porque services/shared esta en
el sys.path de api-gateway y media-processor.
"""
import re

from yt_dlp.extractor.common import InfoExtractor

_VIDEO_EXTS = "webm|mp4|mp3|m4a|ogg|opus|mov"


class FourChanFileIE(InfoExtractor):
    """Archivos directos de 4chan: https://i.4cdn.org/<tablero>/<archivo>.<ext>"""

    IE_NAME = '4chan:file'
    IE_DESC = 'Archivos directos de 4chan (i.4cdn.org / is.4chan.org)'
    _VALID_URL = r'https?://(?:i\.4cdn\.org|is\.4chan\.org)/(?P<board>[^/?#]+)/(?P<file>[^/?#]+\.(?:%s))$' % _VIDEO_EXTS

    def _real_extract(self, url):
        mobj = self._match_valid_url(url)
        filename = mobj.group('file')
        video_id = re.sub(r'[\W_]+', '', filename) or '4chan'
        return {
            'id': video_id,
            'url': url,
            'title': filename,
            'ext': filename.rsplit('.', 1)[-1].lower(),
        }


class FourChanIE(InfoExtractor):
    """Hilos de 4chan/4channel; devuelve el primer archivo de video del hilo."""

    IE_NAME = '4chan'
    IE_DESC = 'Hilos de 4chan y 4channel: primer archivo de video del hilo'
    _VALID_URL = r'''(?x)
        https?://(?:www\.)?(?:boards\.|sys\.)?(?P<site>4chan\.org|4channel\.org)/
        (?P<board>[^/?#]+)/thread/(?P<thread_id>\d+)(?:/.*)?$'''

    def _real_extract(self, url):
        mobj = self._match_valid_url(url)
        video_id = mobj.group('thread_id')
        webpage = self._download_webpage(url, video_id)

        files = []
        for m in re.finditer(
                r'''(["'])https?://(?:i\.4cdn\.org|is\.4chan\.org)/(?P<file>[^"']+?\.(?:%s))\1''' % _VIDEO_EXTS,
                webpage,
        ):
            files.append(m.group(0)[1:-1])

        og = re.search(
            r'''<meta[^>]+(?:content|property)=["']og:video["'][^>]+(?:content|property)=["']([^"']+)["']''',
            webpage,
        )
        if not og:
            og = re.search(
                r'''<meta[^>]+(?:content|property)=["']([^"']+)["'][^>]+(?:content|property)=["']og:video["']''',
                webpage,
            )
        if og:
            files.append(og.group(1))

        if not files:
            self.raise_no_formats('No se encontró ningún archivo de video en el hilo', expected=True)

        unique = list(dict.fromkeys(files))
        title_m = re.search(r'<title[^>]*>([^<]+)</title>', webpage)
        title = title_m.group(1).strip() if title_m else None

        entries = []
        for i, file_url in enumerate(unique, 1):
            ext = file_url.rsplit('.', 1)[-1].lower().split('?')[0]
            entries.append({
                'id': f'{video_id}-{i}',
                'url': file_url,
                'title': f'{title or video_id} {i}',
                'ext': ext,
            })

        if len(entries) == 1:
            return entries[0]
        return self.playlist_result(entries, video_id, title)
