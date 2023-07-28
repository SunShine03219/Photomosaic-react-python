from requests_html import HTMLSession
import json
import urllib


class BingImageScraper:
    def __init__(self, search_term):
        self._count = 35
        self._query = urllib.parse.quote_plus(search_term)
        self._first = 1
        self._session = HTMLSession()

    def get_results(self, count=-1, first=-1):
        first = first if first >= 0 else self._first
        count = count if count >= 0 else self._count
        query = self._query
        html = self._session.get(
            f"https://www.bing.com/images/async?q={query}&first={first}&count={count}").html
        # print(html)
        img_urls = []
        for a in html.find('.imgpt a.iusc'):
            m = json.loads(a.attrs['m'])
            img_urls.append(m["murl"])

        self._first += self._count

        return img_urls
