import numpy as np, subprocess, re
SR=48000; FPS=30; V="/workspace/videos/quiz_your_girlfriend_v5b.mp4"
ev=[(float(l[:8]),l[10:].strip()) for l in open("rr5b/events.txt")]
def dec(args): return np.frombuffer(subprocess.run(["ffmpeg","-v","error"]+args+["-f","f32le","-ac","1","-ar",str(SR),"-"],capture_output=True).stdout,np.float32)
mix=dec(["-i",V])
subprocess.run("ffmpeg -y -v error -f f32le -ar 48000 -ac 1 -i rr5b/voice.f32 -c:a aac -b:a 192k -ar 48000 -ac 2 /tmp/voice_v5b.m4a",shell=True)
vo=dec(["-i","/tmp/voice_v5b.m4a"])
def env(a,w=0.002): k=int(w*SR); return np.sqrt(np.convolve(a**2,np.ones(k)/k,"same"))
Em,Ev=env(mix),env(vo)
def on(E,t,pre=0.08,post=0.15,rel=-25):
    a,b=max(0,int((t-pre)*SR)),int((t+post)*SR); seg=E[a:b]; base=np.median(E[a:a+int(0.03*SR)])
    th=max(base*4,seg.max()*10**(rel/20)); return (a+np.argmax(seg>th))/SR
# text first-appearance frame via frame-to-frame luma diff (small scaled gray)
raw=subprocess.run(["ffmpeg","-v","error","-i",V,"-vf","scale=108:192,format=gray","-f","rawvideo","-"],capture_output=True).stdout
fr=np.frombuffer(raw,np.uint8).reshape(-1,192,108).astype(int)
diff=np.r_[0,np.abs(np.diff(fr,axis=0)).mean((1,2))]
def won(E,t):
    # connected-speech word onset: lowest-energy point within 70ms before the word, then first rise above -32dB rel local peak
    a=max(0,int((t-.07)*SR)); b=int((t+.08)*SR); seg=E[a:b]; j=int(np.argmin(seg[:int(.1*SR)])); pk=E[a:int((t+.4)*SR)].max()
    return (a+j+np.argmax(seg[j:]>pk*10**(-32/20)))/SR
def textframe(t):
    f0=int(round(t*FPS)); c=[f for f in range(f0-3,f0+4) if diff[f]>1.0]; return min(c,key=lambda f:abs(f-f0))/FPS if c else None
rows=[];popl=[t for t,l in ev if l.startswith("pop '")];pi=0
for t,l in ev:
    m=re.match(r"word '(.*)'$",l)
    if not m: continue
    fr=m.group(1); c=[a for a,b in ev if b==f"pop '{fr}'" and a<=t+.05]; pt=max(c) if c else int(t*FPS)/FPS; pi+=1; tf=textframe(pt); tf=pt if tf is None else tf; vm=won(Ev,t)
    rows.append((fr if fr!="HOOK" else "Quiz your bf!",pt,tf,on(Em,pt,0.03,0.05),t,vm,(vm-(tf if tf is not None else pt))*1000))
print(f"{'fragment':16} {'textExp':>7} {'textMeas':>8} {'popMeas':>7} {'wordTS':>7} {'voMeas':>7} {'VO-text ms':>9}")
for r in rows: print(f"{r[0][:16]:16} {r[1]:7.3f} {(r[2] or -1):8.3f} {r[3]:7.3f} {r[4]:7.3f} {r[5]:7.3f} {r[6]:9.1f}")
lag=[r[6] for r in rows]; terr=[abs(r[2]-r[1])*1000 for r in rows]; verr=[abs(r[5]-r[4])*1000 for r in rows]
print(f"text frame err max {max(terr):.1f}ms | word-ts vs audio onset max {max(verr):.1f}ms | VO after text: min {min(lag):.1f} max {max(lag):.1f}ms")
# questions
qs=[(t,l) for t,l in ev if re.match(r"vo q\d",l)]
qe=[abs(on(Ev,t)-t)*1000 for t,l in qs]; print("question VO onset err max %.1fms"%max(qe))
print("mix peak dBFS %.2f"%(20*np.log10(np.abs(mix).max())))
