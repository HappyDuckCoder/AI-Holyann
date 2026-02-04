// Load environment variables
require('dotenv').config();

// Test server action directly
const fs = require('fs');
const path = require('path');

// Mock FormData for Node.js testing
class MockFormData {
  constructor() {
    this.data = new Map();
  }

  append(key, value) {
    this.data.set(key, value);
  }

  get(key) {
    return this.data.get(key);
  }

  entries() {
    return this.data.entries();
  }
}

// Mock File for Node.js testing
class MockFile {
  constructor(buffer, name, type) {
    this.size = buffer.length;
    this.name = name;
    this.type = type;
    this._buffer = buffer;
  }

  async arrayBuffer() {
    return this._buffer;
  }
}

async function testServerAction() {
  try {
    console.log('🧪 Testing Server Action directly...');

    // Debug environment variables
    console.log('🔧 Environment check:');
    console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('\n❌ Environment variables not loaded. Skipping server action test.');
      console.log('✅ This indicates the issue might be environment-related.');
      console.log('🎯 Test the upload in browser instead.');
      return;
    }

    // Read a test file
    const testFilePath = path.join(__dirname, 'package.json'); // Use package.json as test file
    const fileBuffer = fs.readFileSync(testFilePath);

    // Create mock file
    const mockFile = new MockFile(fileBuffer, 'test-package.json', 'application/json');

    // Create mock FormData
    const formData = new MockFormData();
    formData.append('file', mockFile);
    formData.append('userId', 'd85427d3-e609-40e5-80ff-2b306c4904c9'); // st1 user ID
    formData.append('category', 'applications');

    console.log('📤 Mock FormData prepared:');
    console.log('   File:', mockFile.name, `(${mockFile.size} bytes)`);
    console.log('   UserId:', formData.get('userId'));
    console.log('   Category:', formData.get('category'));

    // Import and call the server action
    // Note: This requires the action to be importable in Node.js context
    const { uploadFileServerAction } = require('./src/actions/upload.ts');

    console.log('\n🚀 Calling uploadFileServerAction...');
    const result = await uploadFileServerAction(formData);

    console.log('\n📥 Server Action Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ Server Action test PASSED');
      console.log('🔗 File URL:', result.url);
    } else {
      console.log('\n❌ Server Action test FAILED');
      console.log('💥 Error:', result.error);
    }

  } catch (error) {
    console.error('❌ Server Action test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testServerAction();
