r"""Extractor XNXX ampliado a dominios regionales (plugin de yt-dlp).

La regex nativa de yt-dlp solo cubre (?:video|www).xnxx3?.com; los
dominios regionales (xnxx.es, xnxx.tv, xnxx3.com sin prefijo...) caian a
GenericIE. Esta subclase amplia el patron conservando el grupo (?P<id>...)
que exige _match_id() y delega toda la logica en el extractor nativo.
"""
import re

from yt_dlp.extractor.xnxx import XNXXIE as XNXXBase

_VALID_DOMAINS = r"(?:com|es|tv|desi|se|club|am|rt)"


class XNXXIE(XNXXBase):
    IE_NAME = "XNXX"
    IE_DESC = "Videos de XNXX (xnxx.com y dominios regionales)"
    _VALID_URL = re.compile(
        rf"https?://(?:[^/?#]+\.)?xnxx3?\.{_VALID_DOMAINS}/video-?(?P<id>[0-9a-z]+)/"
    )
