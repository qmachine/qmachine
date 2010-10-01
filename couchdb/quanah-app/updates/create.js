function (doc, req) {
    if (!doc) {
        if (req.docID) {
            return [{_id: req.docId}, "New World"];
        }
        return [null, "Empty World"];
    }
    doc.buildfile = req.form.buildfile;
    doc.time_submitted = (new Date()).getTime();
    return [doc, 'It worked! see ' + doc._id ];
}