import katex from 'katex';

const exactFormulas:Record<string,string>={
  'CMᵢⱼ=#{样本 | y=i, ŷ=j}':'CM_{ij}=\\#\\{n\\mid y_n=i,\\,\\hat y_n=j\\}',
  'μⱼ = (1/m) Σᵢ₌₁ᵐ xⱼ⁽ⁱ⁾':'\\mu_j = \\frac{1}{m} \\sum_{i=1}^{m} x_j^{(i)}',
  'σⱼ = √[(1/m) Σᵢ₌₁ᵐ (xⱼ⁽ⁱ⁾ - μⱼ)²]':'\\sigma_j = \\sqrt{\\frac{1}{m} \\sum_{i=1}^{m} \\left(x_j^{(i)}-\\mu_j\\right)^2}',
  'zⱼ⁽ⁱ⁾ = (xⱼ⁽ⁱ⁾ - μⱼ) / σⱼ':'z_j^{(i)} = \\frac{x_j^{(i)}-\\mu_j}{\\sigma_j}',
  'xⱼ⁽ⁱ⁾ = zⱼ⁽ⁱ⁾σⱼ + μⱼ':'x_j^{(i)} = z_j^{(i)}\\sigma_j+\\mu_j',
  'θₜ₊₁ = θₜ - α∇J(θₜ)':'\\theta_{t+1}=\\theta_t-\\alpha\\nabla J(\\theta_t)',
  'θ⁽ᵗ⁺¹⁾=θ⁽ᵗ⁾-η∇θL(θ⁽ᵗ⁾)':'\\theta^{(t+1)}=\\theta^{(t)}-\\eta\\nabla_{\\theta}L\\left(\\theta^{(t)}\\right)',
  'rₜ = |Jₜ-Jₜ₋₁| / max(|Jₜ₋₁|, ε)':'r_t=\\frac{|J_t-J_{t-1}|}{\\max(|J_{t-1}|,\\varepsilon)}',
  'z=wᵀx+b=Σⱼwⱼxⱼ+b':'z=\\mathbf{w}^{\\mathsf T}\\mathbf{x}+b=\\sum_j w_jx_j+b',
  'd(x,y)=√Σⱼ(xⱼ-yⱼ)²':'d(\\mathbf{x},\\mathbf{y})=\\sqrt{\\sum_j(x_j-y_j)^2}',
  'MSE=(1/n)Σ(yᵢ-ŷᵢ)²；RMSE=√MSE':'\\operatorname{MSE}=\\frac{1}{n}\\sum_i(y_i-\\hat y_i)^2,\\qquad \\operatorname{RMSE}=\\sqrt{\\operatorname{MSE}}',
  'LCE=-(1/n)ΣᵢΣₖ yᵢₖlog p̂ᵢₖ':'\\mathcal{L}_{CE}=-\\frac{1}{n}\\sum_i\\sum_k y_{ik}\\log \\hat p_{ik}',
  'Gini(S)=1-Σₖpₖ²；Gain=Gini(S)-Σc(nc/n)Gini(Sc)':'\\operatorname{Gini}(S)=1-\\sum_kp_k^2,\\qquad \\operatorname{Gain}=\\operatorname{Gini}(S)-\\sum_c\\frac{n_c}{n}\\operatorname{Gini}(S_c)',
};
function normalizeLatex(value:string){if(exactFormulas[value])return exactFormulas[value];return value.replaceAll('μ','\\mu ').replaceAll('σ','\\sigma ').replaceAll('θ','\\theta ').replaceAll('α','\\alpha ').replaceAll('η','\\eta ').replaceAll('λ','\\lambda ').replaceAll('γ','\\gamma ').replaceAll('ρ','\\rho ').replaceAll('ε','\\varepsilon ').replaceAll('∇','\\nabla ').replaceAll('Σ','\\sum ').replaceAll('∈','\\in ').replaceAll('ℝ','\\mathbb{R}').replaceAll('→','\\rightarrow ').replaceAll('≤','\\le ').replaceAll('≥','\\ge ').replaceAll('≈','\\approx ').replaceAll('×','\\times ').replaceAll('·','\\cdot ')}
function render(latex:string,displayMode:boolean){return katex.renderToString(normalizeLatex(latex),{displayMode,throwOnError:true,strict:'ignore',trust:false,output:'html'})}
export function BlockMath({latex,label}:{latex:string;label?:string}){try{return <div className="math-block" role="img" aria-label={label??`公式：${latex}`} dangerouslySetInnerHTML={{__html:render(latex,true)}}/>}catch{return <div className="math-fallback" role="alert"><span>公式渲染失败，降级显示：</span><code>{latex}</code></div>}}
export function InlineMath({latex}:{latex:string}){try{return <span className="math-inline" dangerouslySetInnerHTML={{__html:render(latex,false)}}/>}catch{return <code className="math-inline-fallback" title="公式渲染失败">{latex}</code>}}
export function RichText({children}:{children:string}){const parts=children.split(/(\$[^$]+\$)/g);return <>{parts.map((part,index)=>part.startsWith('$')&&part.endsWith('$')?<InlineMath key={index} latex={part.slice(1,-1)}/>:part)}</>}
