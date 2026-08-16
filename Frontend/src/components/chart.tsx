export function BalanceChart() {
  return <section className="chart panel"><div className="panel-head"><h2>Balanslar dinamikasi</h2><select aria-label="Davr"><option>So‘nggi 30 kun</option><option>6 oy</option></select></div>
    <div className="legend"><span className="prime-dot"/>Prime Capital <span className="php-dot"/>PHP Invest</div>
    <svg viewBox="0 0 760 260" role="img" aria-label="Balanslar dinamikasi grafigi">
      {[40,95,150,205].map((y)=><line key={y} x1="42" x2="748" y1={y} y2={y} className="grid"/>)}
      <polyline className="prime-line" points="42,105 110,120 175,95 240,102 305,80 370,88 435,72 500,95 565,78 630,82 690,62 748,35"/>
      <polyline className="php-line" points="42,155 110,168 175,142 240,150 305,132 370,138 435,144 500,130 565,145 630,136 690,160 748,175"/>
      {['25 Apr','1 May','7 May','13 May','19 May','25 May'].map((x,i)=><text x={42+i*139} y="245" key={x}>{x}</text>)}
    </svg>
  </section>;
}
