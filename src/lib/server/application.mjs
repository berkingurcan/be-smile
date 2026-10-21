import { socialPlatforms, validateSocial } from '../social.mjs';

export function validateApplication(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { valid:false };
  if (typeof input.website === 'string' && input.website.trim()) return { valid:false, bot:true };
  const clean = (value,max) => typeof value === 'string' && value.trim().length <= max && !/[\r\n\0]/.test(value) ? value.trim() : '';
  const name = clean(input.name,100), contact=clean(input.contact,180);
  const language=['ru','tr','de','en'].includes(input.language)?input.language:'';
  const role=['','0','1','2','3'].includes(input.role)?input.role:null;
  const consent=input.consent==='yes';
  if (name.length<2 || contact.length<3 || !language || role===null || !consent) return {valid:false};
  const social = validateSocial(input.socialPlatform, input.socialUsername);
  if (!social.valid) return {valid:false,code:'invalid_social'};
  return {valid:true,data:{name,contact,language,role,consent,socialPlatform:social.platform,socialUsername:social.username}};
}

export function applicationEmail(data) {
  const roles=['Sports & fitness','Kids club','Music & dance','Hotel animation'];
  return [
    'New Be Smile application', '',
    `Name: ${data.name}`, `Contact: ${data.contact}`,
    ...(data.socialPlatform ? [`Social media: ${socialPlatforms.find(option => option.value === data.socialPlatform)?.label || 'Other'} — ${data.socialUsername}`] : []),
    `Preferred language: ${data.language}`,
    `Interested in: ${data.role===''?'Help choosing a role':roles[Number(data.role)]}`,
    'Consent: applicant agreed to use of these details to respond to their application.'
  ].join('\n');
}

export const MAX_CV_BYTES = 3 * 1024 * 1024;
export const MAX_APPLICATION_BYTES = MAX_CV_BYTES + 32 * 1024;

export class ApplicationInputError extends Error {
  constructor(status, code = 'invalid') { super(code); this.status = status; this.code = code; }
}

export async function cvAttachment(file) {
  if (file === null || file === undefined) return null;
  if (typeof file !== 'object' || typeof file.arrayBuffer !== 'function' || typeof file.name !== 'string') throw new ApplicationInputError(400, 'invalid_cv');
  if (file.name === '' && file.size === 0) return null;
  if (file.size > MAX_CV_BYTES) throw new ApplicationInputError(413, 'invalid_cv');
  if (!file.size || !/\.(pdf|docx)$/i.test(file.name)) throw new ApplicationInputError(400, 'invalid_cv');
  const bytes = Buffer.from(await file.arrayBuffer());
  const pdf = /\.pdf$/i.test(file.name) && bytes.subarray(0,5).toString() === '%PDF-';
  const docx = /\.docx$/i.test(file.name) && bytes.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04])) && bytes.includes(Buffer.from('[Content_Types].xml')) && bytes.includes(Buffer.from('word/document.xml'));
  if (!pdf && !docx) throw new ApplicationInputError(400, 'invalid_cv');
  return {filename:pdf?'cv.pdf':'cv.docx',content:bytes.toString('base64')};
}

export async function readApplication(request) {
  const type = request.headers.get('content-type') || '';
  const multipart = type.toLowerCase().startsWith('multipart/form-data;');
  const legacyJSON = type.toLowerCase().startsWith('application/json');
  if (!multipart && !legacyJSON) throw new ApplicationInputError(415);
  const maxBytes = multipart ? MAX_APPLICATION_BYTES : 6000;
  if (Number(request.headers.get('content-length') || 0) > maxBytes) throw new ApplicationInputError(413, multipart?'invalid_cv':'invalid');
  if (!request.body) throw new ApplicationInputError(400);
  // Bound the stream before parsing, including requests with no Content-Length.
  const reader = request.body.getReader();
  const chunks = []; let size = 0;
  try {
    while (true) {
      const {done,value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new ApplicationInputError(413, multipart?'invalid_cv':'invalid'); }
      chunks.push(value);
    }
    const parsed = new Response(Buffer.concat(chunks), {headers:{'Content-Type':type}});
    if (legacyJSON) return {input:await parsed.json(),file:null};
    const form = await parsed.formData();
    // A single optional attachment; do not silently ignore extra uploaded files.
    for (const key of new Set(form.keys())) {
      if (form.getAll(key).length !== 1 || (key !== 'cv' && typeof form.get(key) !== 'string')) throw new ApplicationInputError(400);
    }
    return {input:Object.fromEntries(form),file:form.get('cv')};
  } catch (error) {
    if (error instanceof ApplicationInputError) throw error;
    throw new ApplicationInputError(400);
  } finally { reader.releaseLock(); }
}
