
/**
 * Short-Form Bookmark App Backend
 */

const SHEET_ID = ''; // 비워두면 활성 시트 사용
const DRIVE_FOLDER_ID = ''; 

function doGet(e) {
  // 만약 URL 파라미터에 action=getEntries가 있으면 JSON 반환 (API 모드)
  if (e && e.parameter.action === 'getEntries') {
    const data = getEntries();
    return ContentService.createTextOutput(JSON.stringify({success: true, data: data}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 기본은 HTML 페이지 반환
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Shorts Favs')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 외부에서 POST 요청이 올 때 처리 (API 모드)
 */
function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    const data = postData.data;

    if (action === 'addEntry') {
      const result = addEntry(data);
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getEntries() {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const headers = data[0];
  return data.slice(1).map((row, idx) => {
    let obj = { id: (idx + 1).toString() };
    headers.forEach((header, colIdx) => {
      obj[header.toString().toLowerCase()] = row[colIdx];
    });
    return obj;
  });
}

function addEntry(entry) {
  const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0];
  sheet.appendRow([
    entry.date || new Date().toISOString(),
    entry.url,
    entry.thumbnail,
    entry.memo,
    entry.category
  ]);
  return { success: true };
}

function uploadImage(base64Data, fileName) {
  const folder = DRIVE_FOLDER_ID ? DriveApp.getFolderById(DRIVE_FOLDER_ID) : DriveApp.getRootFolder();
  const contentType = base64Data.split(',')[0].split(':')[1].split(';')[0];
  const bytes = Utilities.base64Decode(base64Data.split(',')[1]);
  const blob = Utilities.newBlob(bytes, contentType, fileName || 'upload_' + Date.now());
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getDownloadUrl();
}
