import { Link } from 'react-router-dom';

export default function Queue() {
  return (
    <div className="relative h-screen w-full bg-background-light dark:bg-background-dark flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <Link to="/now-playing" className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">chevron_left</span>
        </Link>
        <h1 className="text-lg font-bold">Now Playing</h1>
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">more_vert</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <div className="aspect-square w-full max-w-sm rounded-xl overflow-hidden shadow-2xl shadow-primary/20">
          <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAojcgBflX36ealXlVS1Yzd0-EW9LlqtHXQLyBDs6zioXA7zimBiKr9IpS0RmNZpx9TOK2WcZBU6bpbVeWjpG_-ryZtYq0R0CNYiBeVwdE6tohWq5SfidC2rrTc-1uwJxZgHYK2nS64Y1C8b75kOLciZRFg0pyjWO-C8x2lfiSX1ymuYvLsWfocgpScw2PLrXUEwytbRUUta8-eb0wavCPiSPYrfLBbWEZ9vHNshvQy4sZZ-9gEv4HzvybeO7yyG8QFnF_EDIC2p40" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-1">Midnight City</h2>
          <p className="text-slate-500 dark:text-slate-400">M83 • Hurry Up, We're Dreaming</p>
        </div>
      </div>

      <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex flex-col justify-end z-50">
        <div className="bg-white dark:bg-[#122017] w-full max-h-[90vh] rounded-t-xl flex flex-col border-t border-primary/10">
          <button className="flex h-6 w-full items-center justify-center shrink-0">
            <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-primary/30"></div>
          </button>

          <div className="flex items-center p-4 justify-between">
            <Link to="/now-playing" className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-primary/10">
              <span className="material-symbols-outlined">close</span>
            </Link>
            <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight flex-1 text-center">Queue</h2>
            <button className="flex px-3 py-1 items-center justify-end">
              <p className="text-primary text-sm font-bold leading-normal">Clear all</p>
            </button>
          </div>

          <div className="px-4">
            <div className="flex border-b border-slate-200 dark:border-primary/10 gap-8">
              <a href="#" className="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-2">
                <p className="text-sm font-bold">Upcoming</p>
              </a>
              <a href="#" className="flex flex-col items-center justify-center border-b-2 border-transparent text-slate-500 dark:text-slate-400 pb-3 pt-2">
                <p className="text-sm font-bold">History</p>
              </a>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2 hide-scrollbar">
            <div className="px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Next From: Taylor Swift Radio</p>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 hover:bg-slate-100 dark:hover:bg-primary/5 group">
              <div className="shrink-0 flex items-center justify-center w-6">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 cursor-grab">drag_indicator</span>
              </div>
              <div className="relative aspect-square rounded-lg size-14 overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALZ0Ufy2RQEd6PJXcM4KzR8DPnYEuaMLpkhwHqru4ovImRILUr-ElU7OGMFwqhtJmW40ShBJrpTmTEPINqtnTGronYXkRtxAqufcNjrmo4AkE2iXetHroo1cgztzsjW8Z1uy7u-Cy2PQf6VweWfRcz0Z0q4xvClo1c1kmch3UHhNNNT2edQjPQujvSWOx0UUrew4bBC5mB6h8oreiON12wD4d1_188HEMWWXlalX07MX4-TpIXyNHjFoOFgb5U4cIPbVawvxRgEeg" />
              </div>
              <div className="flex flex-col flex-1 justify-center min-w-0">
                <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-tight truncate">Cruel Summer</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate">Taylor Swift • Lover</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <span className="material-symbols-outlined text-[20px]">remove_circle_outline</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 hover:bg-slate-100 dark:hover:bg-primary/5 group">
              <div className="shrink-0 flex items-center justify-center w-6">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 cursor-grab">drag_indicator</span>
              </div>
              <div className="relative aspect-square rounded-lg size-14 overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYu9zazQ1lWcP8QSVe4DsmtQa9x5IOBX2gEjKWIvEknflwtVPHqyxTrvcuV3UDv5WGr1L9EbtjoLVxfBL_42I3iFb9BnZD3rUven80yJW9AFoX9GCIFmDi9IM0VFSqk7NZdAhPmK9CTgek0PPsbkh1d9FCR5Iu9Mfv-9C-kLdhn26MwQEWTfEvdSOlrVLld7nNH7wra8xakoeG9OHjE4e_4j2imc-1hqUnnwms182Tx08OMls7saXmYgWpRXfE5WW_BhRxFeMpFLc" />
              </div>
              <div className="flex flex-col flex-1 justify-center min-w-0">
                <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-tight truncate">Vampire</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate">Olivia Rodrigo • GUTS</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <span className="material-symbols-outlined text-[20px]">remove_circle_outline</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 hover:bg-slate-100 dark:hover:bg-primary/5 group">
              <div className="shrink-0 flex items-center justify-center w-6">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 cursor-grab">drag_indicator</span>
              </div>
              <div className="relative aspect-square rounded-lg size-14 overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgmPh0tp3hTM9BqramrwGXAxiD8BLuGIWcMx6tirnldymaxbZLx34h1jmIkMSCg4zTaw0UD8lcbHVLG5PGlB_Mh_8CgPBzBMGQ-jTxMU8mU0Wrc4jltM6Hk-CcDE24WymHaqrnUWbE8HzU02-FEXfiTyUIXsT7iXKRgn-4HPiepCaLgjF4So2-zYJkzZEwkjdnEgP-VBK6rBbT8wmVSlZ6jBsnerLkoHc06K_ZrUhqWvY7Kp54Zn9vkN2cPXpcTyCTPkToRcnSaho" />
              </div>
              <div className="flex flex-col flex-1 justify-center min-w-0">
                <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-tight truncate">Flowers</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate">Miley Cyrus • Endless Summer Vacation</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <span className="material-symbols-outlined text-[20px]">remove_circle_outline</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 hover:bg-slate-100 dark:hover:bg-primary/5 group">
              <div className="shrink-0 flex items-center justify-center w-6">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 cursor-grab">drag_indicator</span>
              </div>
              <div className="relative aspect-square rounded-lg size-14 overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEKwkwlwW7BR9e-s2rQCNNpFA43wqU3p1cJp1uvJiredg6olVOXRMnEfX7UL0RjaQLO-HjGKv0AD2DbifaCyw-MZbZoWcY07EJsTknxTG251ZgGIIMOql9iQ6y9ADhAGTW--1l9yfci7sNUelAHeQUXhdfF_MknucGMj4iKc4__b1exfrmruhhEy6gxx7R7SuW2W1eOwOUDp5Yu1OGZ0uymn2TvgYW011jrVT6pjwFccijOPC7drT2nc4a4HROWMagn07AQUeYgkY" />
              </div>
              <div className="flex flex-col flex-1 justify-center min-w-0">
                <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-tight truncate">Anti-Hero</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate">Taylor Swift • Midnights</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <span className="material-symbols-outlined text-[20px]">remove_circle_outline</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 min-h-[72px] py-2 hover:bg-slate-100 dark:hover:bg-primary/5 group">
              <div className="shrink-0 flex items-center justify-center w-6">
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-600 cursor-grab">drag_indicator</span>
              </div>
              <div className="relative aspect-square rounded-lg size-14 overflow-hidden shrink-0">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBH3-j8J2Gr77ndPq7kBc3FrsaTZqcRFRXbtLmofMfVmv95EYZFBlHqSVKiN4MXN_kgXxDYB6mPLlbRnqvre0cp3n54ZKhxRmgcPdBopH0H3zVUqTaDg5UYb97I8v2iJd7r1CJevvnk6OslbWkXZoV8-RBTAOvNDVuhd03JOUiVZ83jrRzaDp-efSlGlpkdJSCHE9bifyPXugTAqk1LRzWNJ-mVTxQun0vVawm-TTp82OY8FvQfS0VJvy3mxbgbt3UYdvomdc20MhM" />
              </div>
              <div className="flex flex-col flex-1 justify-center min-w-0">
                <p className="text-slate-900 dark:text-slate-100 text-base font-medium leading-tight truncate">Stay</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal truncate">The Kid LAROI • F*CK LOVE 3</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <span className="material-symbols-outlined text-[20px]">remove_circle_outline</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-primary/10">
            <div className="flex items-center gap-4">
              <div className="relative aspect-square rounded overflow-hidden size-10">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuChyZ9qERxtdVitdyV6sbbLcPWdrrMQPOgiLQ24rKwIMgnKzMIoI0nxJERXke7HCCbLCLSEeoemRqle9qxpYv9Mchd7c7h87L7iQksS-dkPez5rVAfmecWGrcCRScDryBE7d4Mh2DMmuvFWQeLrH-uSaaXTzwh8TBV9O9l5FOb0OAgf0PBOrAIh1IgxhLh89kbubH7Q1UgJz10SFGZFamSOEcyzwAkFBZ_FIW-0C2YmqeoSfTNeCWo3fECQFLq_vSqOcidMTKPH4CE" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">Midnight City</p>
                <p className="text-xs text-primary">Now Playing</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary fill-1">pause</span>
                <span className="material-symbols-outlined">skip_next</span>
              </div>
            </div>
          </div>
          <div className="h-8 bg-slate-50 dark:bg-black/20"></div>
        </div>
      </div>
    </div>
  );
}
