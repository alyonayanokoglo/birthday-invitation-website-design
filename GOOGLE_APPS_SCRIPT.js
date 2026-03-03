/**
 * Скопируйте этот код в Google Apps Script (Расширения → Apps Script)
 * и задеплойте как веб-приложение с доступом "Доступ всем пользователям"
 */

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: "ok",
      message: "Отправляйте POST с полями name и response"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var params = e.parameter;
    var name = params.name || "";
    var response = params.response || "";

    sheet.appendRow([new Date(), name, response]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
