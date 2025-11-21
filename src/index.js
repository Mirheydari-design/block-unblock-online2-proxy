export default {
  async fetch(request) {
    const backendUrl = "https://mahdaviat.metafo.ir/api/admin/block/post";

    const body = await request.text();

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": "v7x4q817c8fo2e1827y3s6315f9e9izv"
      },
      body
    });

    return res;
  }
};
