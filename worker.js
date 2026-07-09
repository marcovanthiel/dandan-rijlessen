// Kleine host-router vóór de statische assets (run_worker_first):
// - artnijmegen.nl (+www) verwijst 301 door naar dandandrive.nl (verhuizing 9-7-2026)
// - www.dandandrive.nl normaliseert naar het apex-domein
// Alle overige verzoeken gaan ongewijzigd naar de statische assets.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const h = url.hostname;
    if (h === 'artnijmegen.nl' || h === 'www.artnijmegen.nl' || h === 'www.dandandrive.nl') {
      url.hostname = 'dandandrive.nl';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  }
};
