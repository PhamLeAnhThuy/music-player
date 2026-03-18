import { Link } from 'react-router-dom';

export default function Search() {
  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Search</h1>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">person</span>
          </div>
        </div>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
          <input className="w-full bg-slate-200 dark:bg-primary/10 border-none rounded-lg py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary text-sm font-medium placeholder-slate-500" placeholder="Artists, songs, or podcasts" type="text" />
        </div>
        <nav className="flex gap-6 mt-4 overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-primary/20">
          <a href="#" className="pb-2 text-sm font-bold border-b-2 border-primary text-primary">Songs</a>
          <a href="#" className="pb-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-300">Artists</a>
          <a href="#" className="pb-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-300">Albums</a>
          <a href="#" className="pb-2 text-sm font-bold border-b-2 border-transparent text-slate-500 hover:text-slate-300">Playlists</a>
        </nav>
      </header>

      <main className="flex-1 px-4 py-4 space-y-6 mb-32 overflow-y-auto hide-scrollbar">
        <section>
          <h2 className="text-lg font-bold mb-3">Top Result</h2>
          <div className="bg-slate-200 dark:bg-primary/5 rounded-xl p-4 flex items-center gap-4">
            <img alt="Artist Profile" className="w-20 h-20 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnaWYcQXBOBXFZpUnHaG6Jh2_3dfyHS54EhEDIpq4XZPliAJ0idtvb2ir1sx-XC5h_8ADOiWqeE7BSiOFEvPoNdGJs484r3cMsXquzS3XtigfeCFL5YNxN8UkFi0Wm1uvlPHetr2d8YITsyAQWFKNAqWKqBpCgqKi_h_h8wsh0mr5pHFhVpryACVxTiZSPGnVpVI-cg3WLhcxcp55D0OCqOrLKG-f0KYU2UCT6aFWTTZSYaMHtDJ3sqBVsd9MPsdWh5UCkkg26iVU" />
            <div className="flex-1">
              <h3 className="font-bold text-xl">The Midnight Echo</h3>
              <p className="text-sm text-slate-500 dark:text-primary/60">Artist</p>
            </div>
            <button className="bg-primary text-background-dark p-2 rounded-full shadow-lg">
              <span className="material-symbols-outlined fill-1">play_arrow</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">Songs</h2>
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-2 hover:bg-primary/10 rounded-lg transition-colors group">
              <div className="relative w-12 h-12 shrink-0">
                <img alt="Album Art" className="w-full h-full rounded object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3SjKGgFaTvsM5KV5pGoSqO9acuJO6tP5ijjiueBDrQUuWg67_PDun-byRWm0BUqA2-kBVDorl5TS7b81fcj_kn93b8E4-25EmA9WKs-IOcfWiZo39eSJMS9Hx5CjIdzA8HuEFRBLifDIW2Iwuu0tKfo80et832N2WCJQZmIG8fvSTpe763-BvbYSQPc8K0qxTD5uvM5CjtgdXPW3Hh7D3QsCpp6aXLKnC_lrIa0wpq1gLoWLyKsxGKaUNHTA3NHnUHreTlP4Vjfk" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                  <span className="material-symbols-outlined text-white text-sm fill-1">play_arrow</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">Neon Horizons</h4>
                <p className="text-xs text-slate-500 dark:text-primary/60 truncate">The Midnight Echo • 3:45</p>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-xl">more_vert</span>
            </div>

            <div className="flex items-center gap-3 p-2 hover:bg-primary/10 rounded-lg transition-colors group">
              <div className="relative w-12 h-12 shrink-0">
                <img alt="Album Art" className="w-full h-full rounded object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4MAOTrtufFRKHwiCuaXYlY4lsWT13W5pO91U8cNm3sHjbQBtoAK5hlkuYE5GTnI6vOQDm9pivWbkfliZ3-BdjMcee_H8c0ZWQhfHeMFqemYBIWvI3iZtopyE4qVgTGdi1847ce6lOm4i89UgYNYsnAsDMH6OQP05sorpTWdvp8zcH2ZmpJ7afQ4bngxkJXIpZeMeZKeFTAVzJObXKQFWSEd_OdO9NWBmL1yRG6gCJ5rS7hO8dWpJcMk5DKgmY_OWtZiTwNlvuETw" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                  <span className="material-symbols-outlined text-white text-sm fill-1">play_arrow</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">Velvet Rain</h4>
                <p className="text-xs text-slate-500 dark:text-primary/60 truncate">The Midnight Echo • 4:12</p>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-xl">more_vert</span>
            </div>

            <div className="flex items-center gap-3 p-2 hover:bg-primary/10 rounded-lg transition-colors group">
              <div className="relative w-12 h-12 shrink-0">
                <img alt="Album Art" className="w-full h-full rounded object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvAhoier4zHn5VYREkYfSQlgbos0z5IAEANI5KEh0BIFR0c24bNdgQhcO2BFVKH9Odu_wtvCnk8sg0spqc-dzPJOm-xpxc2trA_M3qK5WKZyYvpnBTHKqdOb9YEce5yRXUru8DfkKg9HYOw9hsnyRAsxBoT3tpzEs0FGNoguT5N52I0gQVf_2Ld4u1JQn6YitONduCL_gj1DWx8ych0GFFXww12tjgSuEC4kypHkYJ_FBQy9cOMpmJ7kMoCEs32L5zEGg2P9CGyFM" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                  <span className="material-symbols-outlined text-white text-sm fill-1">play_arrow</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">Midnight Drive</h4>
                <p className="text-xs text-slate-500 dark:text-primary/60 truncate">The Midnight Echo • 5:01</p>
              </div>
              <span className="material-symbols-outlined text-slate-500 text-xl">more_vert</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3">Other Artists</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <img alt="Artist" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmuVRLGkjurA174evbpuab9n8V04ivASQ4TTq-NpTjWW3x5R4OHCvSxeRCuG3i4i-RwQnlBgbI3YOgGLmT98N11Cy_PgOXja0VaMMvAbqNGXVfikQA9Ypo6_GRZCErFFcSxlaDxSyulTiL3jwTG3vPEqF-ysmHQDhrJ3tmTkbKSvezgejvutAA_UgNIPLrkylB4E3mewVNCox1lxMWZGThyl7XMdn6evIrHfwBwLrOqkzNablr3ETys0V2n_DyCav2Q1mm44P_CbY" />
              <div className="flex-1">
                <h4 className="font-medium">Midnight Jazz Trio</h4>
                <p className="text-xs text-slate-500 dark:text-primary/60">1.2M Monthly Listeners</p>
              </div>
              <button className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-primary/30 text-xs font-bold uppercase tracking-wider">Follow</button>
            </div>
            <div className="flex items-center gap-4">
              <img alt="Artist" className="w-12 h-12 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuABoxdhWn2RxCJt9HjZegcAUC7a3nOW4DzpVSPN8MjvnGA8MlYISWMDUTANyD946Qk55dBp1ql8ZAPXFaFjCHLuDmfWOJkADeh3PcTjZ_3mg8P0hPcNV8wAyzW9twhKlnIqKoGCfXBbE63fPxgJiUOTMaZP_2700J4PDnUPSnPd0QnVqo8FCTxz3KSY0-1KvaY162peHy0mi2sCY6BO8W6QCYZs2G5PsuTT1lQAF3TqnVdWBIpfMY8YQEBbkP5Q1Ccr--cmP30gdV8" />
              <div className="flex-1">
                <h4 className="font-medium">Echo Valley</h4>
                <p className="text-xs text-slate-500 dark:text-primary/60">840K Monthly Listeners</p>
              </div>
              <button className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-primary/30 text-xs font-bold uppercase tracking-wider">Follow</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
