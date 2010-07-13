function (doc, req) {
    if ((doc.code) && (!doc.results)) {
        return true;
    } else {
        return false;
    }
}
