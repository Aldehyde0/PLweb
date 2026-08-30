import Link from 'next/link';
import { ArrowUpRight,Clock3 } from 'lucide-react';
import { resolveConceptLink } from '@/lib/concept-utils';

export function ConceptReferenceList({identifiers,variant='prerequisite'}:{identifiers:string[];variant?:'prerequisite'|'related'}){return <div className={variant==='related'?'reference-grid':'flex flex-wrap gap-2'}>{identifiers.map((identifier)=>{const resolved=resolveConceptLink(identifier);return resolved.href?<Link key={identifier} href={resolved.href} className={variant==='related'?'reference-related reference-available':'reference-chip reference-available'}><span>{resolved.label}</span>{variant==='related'&&<ArrowUpRight/>}</Link>:<span key={identifier} className={variant==='related'?'reference-related reference-missing':'reference-chip reference-missing'} aria-disabled="true"><span>{resolved.label}</span><small><Clock3/>内容待补充</small></span>})}</div>}
