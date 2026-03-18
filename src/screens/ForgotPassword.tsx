import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark">
      <div className="flex items-center p-4 pb-2 justify-between">
        <Link to="/" className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start focus:outline-none">
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
        </Link>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1">Forgot Password</h2>
      </div>

      <div className="flex flex-col px-4 pt-10 pb-6">
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>lock_reset</span>
          </div>
          <h1 className="text-slate-900 dark:text-slate-100 tracking-tight text-[32px] font-bold leading-tight mb-4">Reset Password</h1>
          <p className="text-slate-600 dark:text-slate-400 text-base font-normal leading-relaxed">
            Enter the email associated with your account and we'll send an email with instructions to reset your password.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-slate-100 text-sm font-medium leading-none">Email Address</label>
            <div className="relative">
              <input className="form-input flex w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 text-slate-900 dark:text-slate-100 focus:border-primary focus:ring-1 focus:ring-primary h-14 placeholder:text-slate-400 dark:placeholder:text-slate-600 px-4 text-base font-normal transition-colors" placeholder="example@email.com" type="email" />
            </div>
          </div>
          
          <div className="flex flex-col gap-4 pt-2">
            <button className="flex w-full cursor-pointer items-center justify-center rounded-lg h-14 px-5 bg-primary hover:bg-primary/90 text-background-dark text-base font-bold leading-normal tracking-wide transition-all shadow-lg shadow-primary/20">
              <span>Send reset link</span>
            </button>
            <Link to="/" className="flex w-full cursor-pointer items-center justify-center rounded-lg h-14 px-5 bg-transparent border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-base font-semibold leading-normal hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <span>Back to login</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-auto flex justify-center p-8 opacity-20 pointer-events-none">
        <div className="relative w-full max-w-[300px] h-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent rounded-full blur-3xl translate-y-16"></div>
        </div>
      </div>

      <div className="px-4 py-8 text-center">
        <p className="text-slate-500 dark:text-slate-500 text-sm">
          Having trouble? <a href="#" className="text-primary font-medium underline underline-offset-4">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
