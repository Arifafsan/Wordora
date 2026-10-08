package com.wordora.app;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

@CapacitorPlugin(name = "DocumentExport")
public class DocumentExportPlugin extends Plugin {

    @PluginMethod
    public void exportFileWithPicker(PluginCall call) {
        String fileName = call.getString("fileName");
        String mimeType = call.getString("mimeType", "application/octet-stream");
        String base64Data = call.getString("base64Data");

        if (fileName == null || fileName.trim().isEmpty()) {
            call.reject("File name is required");
            return;
        }
        if (base64Data == null || base64Data.trim().isEmpty()) {
            call.reject("File content is required");
            return;
        }

        try {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType(mimeType);
            intent.putExtra(Intent.EXTRA_TITLE, fileName);

            startActivityForResult(call, intent, "pickerResultCallback");
        } catch (Exception e) {
            call.reject("Failed to open Android document picker: " + e.getMessage(), e);
        }
    }

    @ActivityCallback
    private void pickerResultCallback(PluginCall call, ActivityResult result) {
        if (call == null) return;

        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            Uri uri = result.getData().getData();
            if (uri != null) {
                String base64Data = call.getString("base64Data");
                String fileName = call.getString("fileName");
                try {
                    byte[] data = Base64.decode(base64Data, Base64.DEFAULT);
                    ContentResolver resolver = getContext().getContentResolver();
                    try (OutputStream os = resolver.openOutputStream(uri, "wt")) {
                        if (os != null) {
                            os.write(data);
                            os.flush();
                        } else {
                            call.reject("Could not access target file location");
                            return;
                        }
                    }

                    JSObject ret = new JSObject();
                    ret.put("success", true);
                    ret.put("cancelled", false);
                    ret.put("uri", uri.toString());
                    ret.put("fileName", fileName);
                    ret.put("destination", "Device Storage");
                    call.resolve(ret);
                    return;
                } catch (Exception e) {
                    call.reject("Failed to write document content: " + e.getMessage(), e);
                    return;
                }
            }
        }

        // Result was not OK or uri was null: User dismissed or cancelled the picker
        JSObject ret = new JSObject();
        ret.put("success", false);
        ret.put("cancelled", true);
        ret.put("message", "File save was cancelled by user");
        call.resolve(ret);
    }

    @PluginMethod
    public void saveToDownloads(PluginCall call) {
        String fileName = call.getString("fileName");
        String mimeType = call.getString("mimeType", "application/octet-stream");
        String base64Data = call.getString("base64Data");

        if (fileName == null || fileName.trim().isEmpty()) {
            call.reject("File name is required");
            return;
        }
        if (base64Data == null || base64Data.trim().isEmpty()) {
            call.reject("File content is required");
            return;
        }

        try {
            byte[] data = Base64.decode(base64Data, Base64.DEFAULT);
            Uri savedUri = null;
            String targetPathDescription = "Downloads/Wordora";

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentResolver resolver = getContext().getContentResolver();
                ContentValues contentValues = new ContentValues();
                contentValues.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                contentValues.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
                contentValues.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Wordora");

                Uri collection = MediaStore.Downloads.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
                savedUri = resolver.insert(collection, contentValues);
                if (savedUri != null) {
                    try (OutputStream os = resolver.openOutputStream(savedUri, "wt")) {
                        if (os != null) {
                            os.write(data);
                            os.flush();
                        } else {
                            call.reject("Unable to open output stream in Downloads");
                            return;
                        }
                    }
                }
            } else {
                File downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                File wordoraDir = new File(downloadsDir, "Wordora");
                if (!wordoraDir.exists()) {
                    wordoraDir.mkdirs();
                }
                File targetFile = new File(wordoraDir, fileName);
                try (FileOutputStream fos = new FileOutputStream(targetFile)) {
                    fos.write(data);
                    fos.flush();
                }
                savedUri = Uri.fromFile(targetFile);
                targetPathDescription = targetFile.getAbsolutePath();

                // Notify Android MediaScanner so file is indexed immediately
                MediaScannerConnection.scanFile(
                    getContext(),
                    new String[]{targetFile.getAbsolutePath()},
                    new String[]{mimeType},
                    null
                );
            }

            if (savedUri != null) {
                JSObject ret = new JSObject();
                ret.put("success", true);
                ret.put("cancelled", false);
                ret.put("uri", savedUri.toString());
                ret.put("fileName", fileName);
                ret.put("destination", targetPathDescription);
                call.resolve(ret);
            } else {
                call.reject("Failed to create file in Downloads directory");
            }
        } catch (Exception e) {
            call.reject("Failed to save to Downloads: " + e.getMessage(), e);
        }
    }
}
