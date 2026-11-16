import test from 'node:test';
import assert from 'node:assert/strict';
import { groqService } from '../src/services/groq.service.js';

test('coach uses supported model, bounded request and reasoning budget', async () => {
 const originalFetch=global.fetch, originalKey=process.env.GROQ_API_KEY;
 process.env.GROQ_API_KEY='test-only';
 try {
  global.fetch=async (_url,options)=>{
   const body=JSON.parse(options.body);
   assert.equal(body.model,'openai/gpt-oss-20b');
   assert.equal(body.reasoning_effort,'low');
   assert(body.max_tokens>2048);
   assert(options.signal instanceof AbortSignal);
   return {ok:true,json:async()=>({choices:[{message:{content:'Listo'}}]})};
  };
  assert.equal(await groqService.generarRespuesta('chat',{mensajeUsuario:'Hola',contextoJSON:'{}'}),'Listo');
 } finally { global.fetch=originalFetch; if(originalKey)process.env.GROQ_API_KEY=originalKey;else delete process.env.GROQ_API_KEY; }
});

test('coach reports missing credentials and never forwards provider body', async () => {
 const originalFetch=global.fetch,originalKey=process.env.GROQ_API_KEY;
 try {
  delete process.env.GROQ_API_KEY;
  await assert.rejects(groqService.generarRespuesta('chat',{}),{code:'COACH_NOT_CONFIGURED'});
  process.env.GROQ_API_KEY='test-only';
  global.fetch=async()=>({ok:false,status:429,text:async()=> 'sensitive-provider-data',headers:new Headers({'retry-after':'10'})});
  await assert.rejects(groqService.generarRespuesta('chat',{mensajeUsuario:'Hola'}),error=>error.status===429 && error.retryAfterSeconds===10 && !error.message.includes('sensitive'));
 } finally {global.fetch=originalFetch;if(originalKey)process.env.GROQ_API_KEY=originalKey;else delete process.env.GROQ_API_KEY;}
});
