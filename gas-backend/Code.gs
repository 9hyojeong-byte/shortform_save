
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

function getColumnMapping(headers) {
  const mapping = {};
  headers.forEach((h, i) => {
    const key = h.toString().toLowerCase().trim();
    mapping[key] = i;
  });
  return mapping;
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
    return data.flat().filter(v => v !== "" && v !== null);
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
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const mapping = getColumnMapping(headers);
    
    let categoryStr = "";
    if (Array.isArray(entry.category)) {
      categoryStr = entry.category.join(',');
    } else if (entry.category) {
      categoryStr = String(entry.category);
    }

    const rowToAppend = new Array(headers.length).fill("");
    if (mapping.id !== undefined) rowToAppend[mapping.id] = String(entry.id);
    if (mapping.date !== undefined) rowToAppend[mapping.date] = String(entry.date);
    if (mapping.url !== undefined) rowToAppend[mapping.url] = String(entry.url);
    if (mapping.thumbnail !== undefined) rowToAppend[mapping.thumbnail] = entry.thumbnail ? String(entry.thumbnail) : "";
    if (mapping.memo !== undefined) rowToAppend[mapping.memo] = String(entry.memo || "");
    if (mapping.category !== undefined) rowToAppend[mapping.category] = categoryStr;

    sheet.appendRow(rowToAppend);
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
    const headers = data[0];
    const mapping = getColumnMapping(headers);
    
    const idColumnIndex = mapping.id || 0;

    let categoryStr = "";
    if (Array.isArray(entry.category)) {
      categoryStr = entry.category.join(',');
    } else if (entry.category) {
      categoryStr = String(entry.category);
    }

    for (let i = 1; i < data.length; i++) {
      if (data[i][idColumnIndex].toString() === entry.id.toString()) {
        const rowNum = i + 1;
        
        // Prepare row values based on header mapping
        const rowValues = new Array(headers.length).fill("");
        if (mapping.id !== undefined) rowValues[mapping.id] = String(entry.id);
        if (mapping.date !== undefined) rowValues[mapping.date] = String(entry.date);
        if (mapping.url !== undefined) rowValues[mapping.url] = String(entry.url);
        if (mapping.thumbnail !== undefined) rowValues[mapping.thumbnail] = entry.thumbnail ? String(entry.thumbnail) : data[i][mapping.thumbnail];
        if (mapping.memo !== undefined) rowValues[mapping.memo] = String(entry.memo || "");
        if (mapping.category !== undefined) rowValues[mapping.category] = categoryStr;

        sheet.getRange(rowNum, 1, 1, headers.length).setValues([rowValues]);
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
    const headers = data[0];
    const mapping = getColumnMapping(headers);
    const idColumnIndex = mapping.id || 0;

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
