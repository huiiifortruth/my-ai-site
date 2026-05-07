export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      {/* 登录卡片主体 */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            欢迎来到北理新生万事通
          </h1>
          <p className="text-sm text-gray-500">
            请登录
          </p>
        </div>

        {/* 表单区域 */}
        <form className="space-y-6">
          {/* 邮箱输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              学号
            </label>
            <input
              type="email"
              placeholder="xxxxxxxx"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 密码输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密码
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* 登录按钮 */}
          <button
            type="button" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            登 录
          </button>
        </form>

        {/* 底部提示 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          还没有账号？{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors">
            联系管理员分配
          </a>
        </div>
        
      </div>
    </main>
  );
}