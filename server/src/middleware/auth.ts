import {Request,Response,NextFunction} from 'express'; import jwt from 'jsonwebtoken';
export interface AuthRequest extends Request { admin?: {id:string;role:string} }
export const requireAdmin=(req:AuthRequest,res:Response,next:NextFunction)=>{const token=req.headers.authorization?.replace('Bearer ','');if(!token)return res.status(401).json({message:'Authentication required'});try{req.admin=jwt.verify(token,process.env.JWT_SECRET||'') as {id:string;role:string};next()}catch{return res.status(401).json({message:'Invalid or expired session'})}};
