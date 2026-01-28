
/**
 * Short-Form Bookmark App Backend
 */

const SHEET_ID = '1yfwSgo-VuHVbqr4JFVL2CG9L0h3a-L8RgDgt5lnOyvg'; 
const SHEET_NAME = 'Bookmarks';
const DRIVE_FOLDER_ID = '1LVw4RfpIl-mxtiQWbMhF5kQcL7ro6ard'; 

function doGet(e) {
  if (e && e.parameter.action === 'getEntries') {
    const data = getEntries();
    return ContentService.createTextOutput(JSON.stringify({success: true, data: data}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile('index').setTitle('Shorts Favs');
}

function doPost(e) {
  try {
    let postData = JSON.parse(e.postData.contents);
    const { action, data } = postData;

    if (action === 'addEntry') {
      return ContentService.createTextOutput(JSON.stringify(addEntry(data))).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'updateEntry') {
      return ContentService.createTextOutput(JSON.stringify(updateEntry(data))).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'deleteEntry') {
      return ContentService.createTextOutput(JSON.stringify(deleteEntry(data.id))).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Unknown action"})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getTargetSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.getSheets()[0];
    if (sheet && sheet.getLastRow() === 0) sheet.setName(SHEET_NAME);
  }
  return sheet;
}

function getEntries() {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTargetSheet(ss);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    return data.slice(1).map((row) => {
      let obj = {};
      headers.forEach((header, colIdx) => {
        if (header) obj[header] = row[colIdx];
      });
      return obj;
    });
  } catch (e) {
    return [];
  }
}

function addEntry(entry) {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTargetSheet(ss);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id', 'date', 'url', 'thumbnail', 'memo', 'category']);
    }
    sheet.appendRow([entry.id, entry.date, entry.url, entry.thumbnail, entry.memo, entry.category]);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function updateEntry(entry) {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTargetSheet(ss);
    const data = sheet.getDataRange().getValues();
    const idColumnIndex = 0; // 'id'가 첫 번째 컬럼이라고 가정

    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumnIndex].toString() === entry.id.toString()) {
        // 행 번호는 i+1 (0-based index 때문)
        // id, date, url, thumbnail, memo, category 순서
        const range = sheet.getRange(i + 1, 1, 1, 6);
        range.setValues([[entry.id, entry.date, entry.url, entry.thumbnail, entry.memo, entry.category]]);
        return { success: true };
      }
    }
    return { success: false, message: "ID not found" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function deleteEntry(id) {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getTargetSheet(ss);
    const data = sheet.getDataRange().getValues();
    const idColumnIndex = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumnIndex].toString() === id.toString()) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, message: "ID not found" };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}
