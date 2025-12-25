# How to Test Your Camera's RAW Files

As a photographer, the most important thing is knowing if **Stillbytes** can actually read your specific camera's files (Canon .CR2, Nikon .NEF, Sony .ARW, etc.).

We have created a simple "Diagnostic Tool" to check this without needing to run the full application.

## Step 1: Open the Terminal

1. In VS Code, look at the bottom panel where the "Terminal" usually is.
2. If you don't see it, press `` Ctrl + ` `` (the backtick key, usually under Esc).
3. Ensure you are in the project folder (`Z:\dev\projects\stillbytes`).

## Step 2: Run the Test

Type the following command, but **replace the path at the end** with the path to one of your real RAW photos.

**Tip:** You can usually just type `node scripts/check-raw-support.js` (add a space) and then **drag and drop** a photo file from your Windows File Explorer directly into the VS Code terminal window. It will paste the path for you!

```powershell
node scripts/check-raw-support.js "C:\Users\YourName\Pictures\MyPhoto.ARW"
```

## Step 3: Read the Results

### ✅ If you see "SUCCESS!"
Great news! The current image engine (`sharp`) can read your camera's RAW files out of the box. You don't need to do anything else.

### ❌ If you see "FAILED"
This means the default engine doesn't understand your RAW format yet.
**Don't panic!** This is common in development.

**Please copy the error message** (especially the part that says "Error message: ...") and paste it into our chat. We will fix it by adding a specialized RAW decoding library (`libraw`).
