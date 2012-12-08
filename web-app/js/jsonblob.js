$(function () {
    var jsonFormatterId = "json-formatter";
    var jsonEditorId = "json-editor";
    var alertsEditorId = "alerts-editor";
    var alertsformatterId = "alerts-formatter";
    var toFormatterId = "to-formatter";
    var toEditorId = "to-editor";
    var newId = "new";
    var openFileId = "open-file";
    var openUrlId = "open-url";
    var saveFileId = "save-file";
    var saveUrlId = "save-url";
    var cleanId = "clear";
    var rawUrl = "raw-json";

    var apiBase = "/api/jsonBlob";
    var blobId = window.location.pathname.substr(1);

    var defaultJson = {
        "name": "John Smith",
        "age": 32,
        "employed": true,
        "address": {
            "street": "701 First Ave.",
            "city": "Sunnyvale, CA 95125",
            "country": "United States"
        },
        "children": [
            {
                "name": "Richard",
                "age": 7
            },
            {
                "name": "Susan",
                "age": 4
            },
            {
                "name": "James",
                "age": 3
            }
        ]
    };

    var lastChangeByEditor = null;
    var editor = null;
    var formatter = null;

    // basic functions for the API
    var save = function() {
        if (!blobId) {
            var request = {
                type: "POST",
                url: apiBase,
                headers: {'Content-Type': 'application/json', 'Accept':'application/json'},
                data: formatter.getText(),
                success: function(data, textStatus, jqXHR) {
                    var locationHeader = jqXHR.getResponseHeader("Location");
                    var parts = locationHeader.split("/");
                    blobId = parts[parts.length - 1];
                    $('#' + rawUrl).removeClass("hidden").show("slow");
                },
                cache: false
            };
            $.ajax(request);
        } else {
            var blobApiUrl = [apiBase, blobId].join("/")
            var request = {
                type: "PUT",
                url: blobApiUrl,
                headers: {'Content-Type': 'application/json', 'Accept':'application/json'},
                data: formatter.getText(),
                success: function(data, textStatus, jqXHR) {},
                cache: false
            };
            $.ajax(request);
        }
    };

    var reset = function() {
        var json = {};
        formatter.set(json);
        editor.set(json);
        blobId = ""
        $('#' + rawUrl).addClass("hidden").show();
    }

    var formatterToEditor = function() {
        try {
            $("#" + alertsformatterId).empty();
            editor.set(formatter.get());
            if (blobId) {
                save();
            }
        } catch (err) {
            var msg = err.message.substr(0, err.message.indexOf("<a")) // remove json lint link
            $("#" + alertsformatterId).append('<div class="alert alert-block alert-error fade in"><button type="button" class="close" data-dismiss="alert">&times;</button>' + msg + '</div>');
            $("#" + alertsformatterId + ".alert").alert();
        }
    };

    var editorToFormatter = function () {
        try {
            $("#" + alertsEditorId).empty();
            formatter.set(editor.get());
            if (blobId) {
                save();
            }
        } catch (err) {
            $("#" + alertsEditorId).append('<div class="alert alert-block alert-error fade in"><button type="button" class="close" data-dismiss="alert">×</button>' + err.message + '</div>');
            $("#" + alertsEditorId + ".alert").alert();
        }
    };

    // setup the formatter
    formatter = new JSONFormatter(document.getElementById(jsonFormatterId), {
        change: function () {
            lastChanged = formatter;
        }
    });

    // setup the editor
    editor = new JSONEditor(document.getElementById(jsonEditorId), {
        change: function () {
            lastChanged = editor;
        }
    });

    if (!blobId) {
        formatter.set(defaultJson)
        editor.set(defaultJson)
    } else {
        var blobApiUrl = [apiBase, blobId].join("/")
        $.getJSON(blobApiUrl, function(data) {
            formatter.set(data);
            editor.set(data);
            $('#' + rawUrl).removeClass("hidden").show();
        });
    }

    /* hook up the UI stuff */
    // raw JSON link
    $('#' + rawUrl).click(function() {
        if (blobId) {
            var blobApiUrl = [apiBase, blobId].join("/")
            window.open(blobApiUrl, "jsonBlob_" + blobId);
        }
    });

    $('#' + saveUrlId).click(function() {
        save();
    });

    // clear the editor and formatter with either the new or clear buttons
    $("#" + cleanId + ", #" + newId).click(function() {
       reset();
    })

   $("#" + toEditorId).click(function() {
       formatterToEditor();
   });

    $("#" + toFormatterId).click(function() {
        editorToFormatter();
    });

});
