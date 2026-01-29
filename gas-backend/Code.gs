
/**
 * Short-Form Bookmark App Backend
 */

const SHEET_ID = '1yfwSgo-VuHVbqr4JFVL2CG9L0h3a-L8RgDgt5lnOyvg'; 
const SHEET_NAME = 'Bookmarks';
const CATEGORY_SHEET_NAME = 'Categories';

function doGet(e) {
  const action = e ? e.parameter.action : '';
  
  if (action === 'getEntries') {
    const data = getEntries();
    return ContentService.createTextOutput(JSON.stringify({success: true, data: data}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getCategories') {
    const data = getCategories();
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
    } else if (action === 'addCategory') {
      return ContentService.createTextOutput(JSON.stringify(addCategory(data.category))).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: false, message: "Unknown action"})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({success: false, message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function getEntries() {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];
    
    const headers = data[0].map(h => h.toString().toLowerCase().trim());
    return data.slice(1).map((row) => {
      let obj = {};
      headers.forEach((header, colIdx) => {
        let val = row[colIdx];
        if (header === 'category') {
          const valStr = val ? val.toString() : "";
          if (valStr.indexOf('[Ljava.lang.Object') > -1) {
            obj[header] = [];
          } else {
            obj[header] = valStr ? valStr.split(',').filter(v => v.trim() !== "") : [];
          }
        } else {
          obj[header] = val;
        }
      });
      return obj;
    });
  } catch (e) {
    return [];
  }
}

function getCategories() {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, CATEGORY_SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) return [];
    return data.flat().filter(v => v !== "");
  } catch (e) {
    return [];
  }
}

function addCategory(category) {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, CATEGORY_SHEET_NAME);
    const data = sheet.getDataRange().getValues().flat();
    
    if (data.indexOf(category) === -1) {
      sheet.appendRow([category]);
    }
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function addEntry(entry) {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['id', 'date', 'url', 'thumbnail', 'memo', 'category']);
    }
    
    let categoryStr = "";
    if (Array.isArray(entry.category)) {
      categoryStr = entry.category.join(',');
    } else if (entry.category) {
      categoryStr = String(entry.category);
    }

    sheet.appendRow([
      String(entry.id), 
      String(entry.date), 
      String(entry.url), 
      String(entry.thumbnail), 
      String(entry.memo), 
      categoryStr
    ]);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.toString() };
  }
}

function updateEntry(entry) {
  try {
    const ss = SHEET_ID ? SpreadsheetApp.openById(SHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getSheet(ss, SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const idColumnIndex = 0;

    let categoryStr = "";
    if (Array.isArray(entry.category)) {
      categoryStr = entry.category.join(',');
    } else if (entry.category) {
      categoryStr = String(entry.category);
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumnIndex].toString() === entry.id.toString()) {
        const rowNum = i + 1;
        const rowValues = [[
          String(entry.id), 
          String(entry.date), 
          String(entry.url), 
          String(entry.thumbnail), 
          String(entry.memo), 
          categoryStr
        ]];
        sheet.getRange(rowNum, 1, 1, 6).setValues(rowValues);
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
    const sheet = getSheet(ss, SHEET_NAME);
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
