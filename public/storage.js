
class Storage {
  // Simple Item Patterns
  getItem(item) {
    const result = localStorage.getItem(item);
    return (result === null) ? null : JSON.parse(result);
  }
  setItem(item, value) {
    return localStorage.setItem(item, JSON.stringify(value));
  }
  removeItem(item) {
    return localStorage.removeItem(item);
  }
}