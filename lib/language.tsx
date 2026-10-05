'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { LANGUAGE_KEY, translate, translateField, type Language } from './i18n';
const LanguageContext=createContext<{language:Language;setLanguage:(language:Language)=>void;error:string}>({language:'zh',setLanguage:()=>{},error:''});
export function LanguageProvider({children}:{children:React.ReactNode}) {
 const [language,setLanguage]=useState<Language>('zh');
 const [error,setError]=useState('');
 useEffect(()=>{
  try{if(localStorage.getItem(LANGUAGE_KEY)==='en')setLanguage('en');}catch{/* Keep Chinese when storage is unavailable. */}
  const changed=(event:StorageEvent)=>{if(event.key===LANGUAGE_KEY)setLanguage(event.newValue==='en'?'en':'zh');};
  window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);
 },[]);
 useEffect(()=>{document.documentElement.lang=language==='en'?'en':'zh-CN';document.title=language==='en'?'Slow Days in Spain · Our Family Journal':'西班牙慢游 · Our Spain Journal';},[language]);
 const select=(next:Language)=>{setLanguage(next);try{localStorage.setItem(LANGUAGE_KEY,next);setError('');}catch{setError(next==='en'?'Language changed for this visit; this browser could not save your preference.':'语言已切换，但浏览器无法保存偏好，下次打开时需重新选择。');}};
 return <LanguageContext.Provider value={{language,setLanguage:select,error}}>{children}</LanguageContext.Provider>;
}
export function useLocale(){
 const {language}=useContext(LanguageContext);
 return {language,t:(value:string)=>translate(value,language),display:<T extends {id?:string},K extends keyof T>(record:T,key:K)=>translateField(record,key,language)};
}
export function LanguageSwitch(){
 const {language,setLanguage,error}=useContext(LanguageContext);
 return <><div className="language-switch" role="group" aria-label="Language / 语言"><button lang="zh-CN" aria-pressed={language==='zh'} onClick={()=>setLanguage('zh')}>中文</button><button lang="en" aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>EN</button></div>{error&&<span className="language-error" role="status">{error}</span>}</>;
}
