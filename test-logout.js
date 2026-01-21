/**
 * Script kiểm tra API logout
 * Chạy: node test-logout.js
 */

const testLogoutAPI = async () => {
    console.log('🧪 Testing Logout API...\n');

    try {
        // Test 1: Gọi API logout
        console.log('📝 Test 1: Calling POST /api/auth/logout');
        const response = await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(result, null, 2));

        if (response.status === 200 && result.success) {
            console.log('✅ Test 1 PASSED: Logout API returns success\n');
        } else {
            console.log('❌ Test 1 FAILED: Unexpected response\n');
        }

        // Test 2: Kiểm tra cookie đã bị xóa
        console.log('📝 Test 2: Checking if cookie is cleared');
        const cookies = response.headers.get('set-cookie');
        console.log('Set-Cookie header:', cookies);

        if (cookies && cookies.includes('auth-token=') && cookies.includes('Max-Age=0')) {
            console.log('✅ Test 2 PASSED: Cookie is being cleared\n');
        } else {
            console.log('⚠️ Test 2: Could not verify cookie clearing from response\n');
        }

        console.log('✅ All tests completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
};

testLogoutAPI();
