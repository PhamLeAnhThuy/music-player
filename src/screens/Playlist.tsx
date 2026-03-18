import { Link } from 'react-router-dom';

export default function Playlist() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 bg-background-light dark:bg-background-dark min-h-screen">
      <header className="flex flex-col md:flex-row items-end gap-8 mb-10">
        <div className="w-full md:w-64 h-64 flex-shrink-0 shadow-2xl rounded-lg overflow-hidden">
          <img alt="Playlist Cover" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgzNym6fAb0Tu_srz565Nqfn7gVux9ENtDdwTUCmzQincyslkrhJje4da7ZoXr2rB0z-tbX7_c0RPYEakzx6UrCYnxswE7VzgQV5ZlWohAEjPJqUP8qg_-whL3HACLE1Olv0ZQEYHAT_bRKtleCRrpCXUlXW6HZJ3qHXKaBsXvaz37ApF_HlfMVKbkyoru5a8PJuE0oHDC7cTxiugQO0bJQ1OP2xRiyDjjcwQjcjl23nm3SmBGyjAd7p5jcOJVDw-qvLQS3IYVaHw" />
        </div>
        <div className="flex-grow flex flex-col items-start gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">Public Playlist</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Late Night Grooves</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
            Deep bass, atmospheric synths, and smooth rhythms for your midnight focus sessions. Curated by the community.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <img alt="Creator Avatar" className="w-6 h-6 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJQqkpQaXc3D1rhrFulE4hKUJ9Jbyro_mRg_0vAJKeb0kIr57ko_odVEnSddK-Unz6MYCyjVgkipxfCy-JAMvaoM8WEcYDAtt9wm4Hoe0HCIrrtitvopDn2hKjL5fn0zagPibH1xAGascl_wRvEUPXMl5x7WFF5wVWqKym7iqDy8wH3wc5-qyL9pPNKXeiF9-BiAGECHJUKNrMMtKj7Tfg0aPjWS3C57WFXfdrYMeowKiAz2PUDCblMhuxTB5_N7fwQbO-MMI-9ZY" />
            <span className="font-semibold text-sm">Marcus Chen</span>
            <span className="text-slate-500 mx-1">•</span>
            <span className="text-sm text-slate-500">2,483 likes</span>
            <span className="text-slate-500 mx-1">•</span>
            <span className="text-sm text-slate-500">24 songs, 1 hr 15 min</span>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-6 mb-8">
        <button className="bg-primary hover:scale-105 transition-transform text-background-dark w-14 h-14 rounded-full flex items-center justify-center shadow-lg">
          <span className="material-icons text-3xl">play_arrow</span>
        </button>
        <button className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-colors">
          <span className="material-icons text-xl">add</span>
          Add song
        </button>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-icons text-3xl">favorite_border</span>
        </button>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-icons text-3xl">more_horiz</span>
        </button>
      </div>

      <div className="grid grid-cols-12 px-4 py-2 border-b border-primary/10 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-6 md:col-span-5">Title</div>
        <div className="hidden md:block md:col-span-3">Album</div>
        <div className="hidden md:block md:col-span-2 text-right">Date Added</div>
        <div className="col-span-5 md:col-span-1 text-right">
          <span className="material-icons text-base">schedule</span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-primary/5 group transition-colors cursor-pointer">
          <div className="col-span-1 text-center text-slate-500 group-hover:text-primary transition-colors">1</div>
          <div className="col-span-6 md:col-span-5 flex items-center gap-4">
            <img alt="Album Art" className="w-10 h-10 rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDu6xB1qP-1a_pUNyCInfusBywaN1Lk-xK0RncsWdvUYI4a-MqBU3fHSjzMR6kqJDefjgdkLyHZPA5kEJjJxx5DuXQl6RgVlx0ap_4kYGD-FVrm9iwm5wsUrJYBeHiAtAv_eBjcP8SiGNdPSi_og8m8AXS0lRaJFk2AhXIa8JreKCz4R3nuWmihBN4moXRvtLcjidg795wakE1TzT9ceq-2y9TeA08FPefYu2rl599uHSha6I09O0vHwK2LuvgBdPsrTlVA8hchn_s" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">Neon Horizons</span>
              <span className="text-sm text-slate-500 truncate group-hover:text-slate-300">Synthwave Collective</span>
            </div>
          </div>
          <div className="hidden md:block md:col-span-3 text-sm text-slate-500 truncate">Cybernetic Pulse</div>
          <div className="hidden md:block md:col-span-2 text-sm text-slate-500 text-right">2 days ago</div>
          <div className="col-span-5 md:col-span-1 flex items-center justify-end gap-4">
            <span className="material-icons text-primary opacity-0 group-hover:opacity-100 text-xl transition-opacity">favorite</span>
            <span className="text-sm text-slate-500">3:45</span>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center px-4 py-3 rounded-lg bg-primary/10 group transition-colors cursor-pointer">
          <div className="col-span-1 text-center text-primary">
            <span className="material-icons text-xl animate-pulse">equalizer</span>
          </div>
          <div className="col-span-6 md:col-span-5 flex items-center gap-4">
            <img alt="Album Art" className="w-10 h-10 rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF-AiUQWQ72-WcA-ronipxpkrVdiPts_FPpxe6UxySDmGmbWwetRXRssz2U24n6ms8hyk2fqb5EvAwwjjlAyR7xz_Q_h7Ulg7Ssx0thf-aDV2pJLeTZnenuAvy9staNDeQ0n3j0V7eb618i8rXAfdUS3zT3X3O4fzF1Tv3Aivh4W84DlUQhv6I5nV74uysecTIRSsdRZQpc6DTnPPzzoe-wVy1DduH7JxtzwGKSyM-a0_xFqCaQKWQeNXK6V_gc3hbCP9a-Cm2tRA" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium text-primary truncate">Midnight Echoes</span>
              <span className="text-sm text-slate-500 truncate group-hover:text-slate-300">The Dreamers</span>
            </div>
          </div>
          <div className="hidden md:block md:col-span-3 text-sm text-slate-500 truncate">Visions in the Dark</div>
          <div className="hidden md:block md:col-span-2 text-sm text-slate-500 text-right">5 days ago</div>
          <div className="col-span-5 md:col-span-1 flex items-center justify-end gap-4">
            <span className="material-icons text-primary text-xl">favorite</span>
            <span className="text-sm text-slate-500">4:12</span>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-primary/5 group transition-colors cursor-pointer">
          <div className="col-span-1 text-center text-slate-500 group-hover:text-primary transition-colors">3</div>
          <div className="col-span-6 md:col-span-5 flex items-center gap-4">
            <img alt="Album Art" className="w-10 h-10 rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7U19M41Y3QGcaTjQexL-q0qLBHSyX2nWhCP-VRiPg2FKboHJX7qmYqoEp4CslnNcrzRGN0Ee8hg3LXUalr6lEG3kvzWwr42GuhdV6skwDhjDpmfWrmUw_rrqvjsIVKY2B2dAgM6OVCdYtjAtcGDiyKc8KvPC3xBrLQANBCXvx3c22d6ABYKtCgXdsP5uTwt-y2YS2ccHCfJx3CDsUhAnhZDSnFYNlQW8tRY9rmokitfpHB3ZYm6x3Jti0clRXVMdxW2v5f8OV-Pc" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">Subterranean</span>
              <span className="text-sm text-slate-500 truncate group-hover:text-slate-300">Low Frequency</span>
            </div>
          </div>
          <div className="hidden md:block md:col-span-3 text-sm text-slate-500 truncate">Deep Dive EP</div>
          <div className="hidden md:block md:col-span-2 text-sm text-slate-500 text-right">1 week ago</div>
          <div className="col-span-5 md:col-span-1 flex items-center justify-end gap-4">
            <span className="material-icons text-primary opacity-0 group-hover:opacity-100 text-xl transition-opacity">favorite_border</span>
            <span className="text-sm text-slate-500">5:01</span>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-primary/5 group transition-colors cursor-pointer">
          <div className="col-span-1 text-center text-slate-500 group-hover:text-primary transition-colors">4</div>
          <div className="col-span-6 md:col-span-5 flex items-center gap-4">
            <img alt="Album Art" className="w-10 h-10 rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7xSxfs8ioQT4XLdo2XtMwwLV4KspVa9JM4oM3dw4bGQqXSnWxadMYPpUeZjNVxMZ3lVRYQ0sSQPRK4qp_8wSbq8mVjeYczkysOYNrxibKi-9Q8QbYCJEqRRTd7123kHysHNNybi9KgTFgQZ9skvxGUx8W51ZxrwZ5eNdQIElabLgW40OwAB34WZrGpqx2Phie7tRcCv-Mq7u8iJHE5-bLICps8mKwVMCMM5wCCAFcOV4ezA-cdEW7KCDRzQvjqp9XKoSs8N4py7U" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">Static Wind</span>
              <span className="text-sm text-slate-500 truncate group-hover:text-slate-300">Ambient Ghost</span>
            </div>
          </div>
          <div className="hidden md:block md:col-span-3 text-sm text-slate-500 truncate">Atmospheres Vol 1</div>
          <div className="hidden md:block md:col-span-2 text-sm text-slate-500 text-right">Nov 12, 2023</div>
          <div className="col-span-5 md:col-span-1 flex items-center justify-end gap-4">
            <span className="material-icons text-primary opacity-0 group-hover:opacity-100 text-xl transition-opacity">favorite_border</span>
            <span className="text-sm text-slate-500">3:22</span>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center px-4 py-3 rounded-lg hover:bg-primary/5 group transition-colors cursor-pointer">
          <div className="col-span-1 text-center text-slate-500 group-hover:text-primary transition-colors">5</div>
          <div className="col-span-6 md:col-span-5 flex items-center gap-4">
            <img alt="Album Art" className="w-10 h-10 rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd-_LfvHqhDYcsb5uXj8zIUTavJvd6UhQqqadRlyds9E9X2Uhgijbd8JMhoboyUBxiVl0uJtifv1ZTtoleZIRDC81mw4cMNgqbAjHMI7DlhTUqwM2UyzCctpWXDIixPph5WlsM2BrqvsoyvGlgl41L8V5krAuublJi-O43ZrpEgahLh9EX0dyP4brPr8wLF6tuOoP52JOCNPGC3r6QXJXFiOpCNpe129y1wSuLEVSbwMjPk0AHG0zkMqOw8K96n50y3yeuC6s6SyQ" />
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">Liquid Motion</span>
              <span className="text-sm text-slate-500 truncate group-hover:text-slate-300">Flow State</span>
            </div>
          </div>
          <div className="hidden md:block md:col-span-3 text-sm text-slate-500 truncate">The Kinetic Theory</div>
          <div className="hidden md:block md:col-span-2 text-sm text-slate-500 text-right">Nov 10, 2023</div>
          <div className="col-span-5 md:col-span-1 flex items-center justify-end gap-4">
            <span className="material-icons text-primary opacity-0 group-hover:opacity-100 text-xl transition-opacity">favorite_border</span>
            <span className="text-sm text-slate-500">4:44</span>
          </div>
        </div>
      </div>

      <section className="mt-16 pb-24">
        <h2 className="text-2xl font-bold mb-6">Recommended for this playlist</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <img alt="Rec Album" className="w-12 h-12 rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIfP0-OzVQVE5stCSUnMhyRAVOr6EGZxYX4OAjvyDHs9LIEtLumWYTrxHjyOhgO1rheKrIAWyLZ16Xjx8I_yz9goXrfC4GqOD21ZLUevhM4CDF2LU7lQjdPNH0_DaukkKJFCL1C2Z4rZr7TXUP9Yn0vTIhVEkefbpdmmIoxejHGBdFHy31H-dvCmMVyhpWhx_cIxweEglgPdGRMUf2U7EBg9Q3LiZPugr1KYQChTyklV36vzenXz4gY7RJ6U_kMCsLK4Jx9Ojvs28" />
              <div>
                <p className="font-medium">Obsidian Dream</p>
                <p className="text-sm text-slate-500">Dark Matter</p>
              </div>
            </div>
            <button className="border border-slate-500 hover:border-slate-100 px-4 py-1.5 rounded-full text-sm font-bold transition-colors">
              Add
            </button>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <img alt="Rec Album" className="w-12 h-12 rounded" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbACakrcFpFSHiGXjWr2LovF0dodc8od3GakcYcHmU-jLDhadVDXKL1ARAnZewRmwJ8WJj7aKULI1kooDCRbcNJ699SVqpbjqVpJgEjYoHgVmSiqliRBdV5REPSWNnldJl2ZlJd3cpBpE4WaEZ6YaFvmSoQd57Jm99y54C7Lhg7tybyET5ND2swMiGEA56LhJwuxs4ppZjBAbXXc_mmtCd2JJALukVd7_IS6m_kg_fQflnYBdLoUrFzgl59LCrSqGaAv0E6sI2ijs" />
              <div>
                <p className="font-medium">Parallel Reality</p>
                <p className="text-sm text-slate-500">Shift</p>
              </div>
            </div>
            <button className="border border-slate-500 hover:border-slate-100 px-4 py-1.5 rounded-full text-sm font-bold transition-colors">
              Add
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
