class ShaderFetcher {
  static fetchShader(path) {
    return fetch(path).then(res => res.text());
  }
}
