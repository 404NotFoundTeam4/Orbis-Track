// ถ้า Login.tsx อยู่ใน pages/

import "../common/styles/css/Login.css"
function Login() {
    return (
        <>
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-96 p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
                    <form className="space-y-4">
                        <div className="flex flex-col">
                            <label className="mb-1">Email</label>
                            <input
                                type="email"
                                className="border rounded px-2 py-1"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="mb-1">Password</label>
                            <input
                                type="password"
                                className="border rounded px-2 py-1"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 rounded w-full hover:bg-blue-600"
                        >
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Login;
