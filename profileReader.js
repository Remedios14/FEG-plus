function ProfileReader(url) {
    if (url === undefined) {
        url = "./profile.json";
    }
    this.url = url;
}

ProfileReader.prototype.readJson = function readJson() {
    var loaded = [];
    request = new XMLHttpRequest();
    request.open("get", this.url, false);
    request.send(null);
    // request.onload = function() {
    if (request.status == 200) {
        console.log("request success");
        json = JSON.parse(request.responseText);
        Object.keys(json).forEach(key => {
            const pd = new ProfileData(key, json[key]);
            loaded.push(pd);
        })
        console.log(loaded[0]);
    }
    return loaded;
    // }
}

function ProfileData(ts, data) {
    this.ts = ts
    this.x = parseFloat(data[0]);
    this.y = parseFloat(data[1]);
    this.z = - 1 * parseFloat(data[2]);
    this.batchCnt = parseInt(data[3]);
    this.drawCallCnt = parseInt(data[7]);
}