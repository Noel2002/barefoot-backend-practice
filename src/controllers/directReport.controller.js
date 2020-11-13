import db from '../models'
import { findTravelRequest } from '../services/travelRequestSearch';
import { getDataFromToken } from '../helper/tokenToData';
import roles from '../utils/roles';
import travelRequestServices from '../services/directTravelRequest';
import NotFoundRequestError from '../utils/notFoundRequestError';
import ApplicationError from '../utils/applicationError';
import BadRequestError from '../utils/badRequestError';

export const getDirectReport = async (req, res, next) => {
    const decoded = await getDataFromToken(req, res, next)
    try{
        const managerId = decoded.id.toString()
        const role = decoded.user_role_id
        const roleType = role == roles.MANAGER
        const offset = req.query.from
        const limit = req.query.to
        const travelId = req.params.travelId
        var pagination = {offset, limit}
        if(managerId && roleType){
            if(travelId){
                var query = {managerId:managerId, travelId:travelId}
                findTravelRequest(res, query, next, pagination)
            }else{
                var query = {managerId:managerId}
                findTravelRequest(res, query, next, pagination)
            }
        }else{
            res.status(401).json({message:"you are not an approved manager"})
        }
    }catch(err){
        console.log(err.message)
    }
}

export const approve_reject_TravelRequest = async (req, res, next) =>{
    const { travel_request_id, action } = req.body;
    try{
        if(action === 'approve' || action === 'reject'){
            const findTravelRequest = await travelRequestServices.findItById({travelId:travel_request_id});
            if(findTravelRequest){
                //travel request can be approve if it is pending or rejected
                //and can be rejected if it is pending only
                if(findTravelRequest.status === 'pending' || (findTravelRequest.status === 'rejected' && action !== 'reject')){
                    const changes = (action === 'approve') ? 'approved': 'rejected';
                    const updateStatus = await travelRequestServices.updateStatus({travelId:travel_request_id, status:changes});
                    if(updateStatus){
                        return res.status(201).json({status: 201, message:`Operation performed successfully!`});
                    }else{
                        throw new ApplicationError("Failed to approve this travel request, try again!",500);
                    }
                }else{
                    throw new BadRequestError(`The travel request is already ${findTravelRequest.status}`,400);
                }
            }else{
                throw new NotFoundRequestError("The travel request does not exist!",404);
            }
        }else{
            throw new BadRequestError("Can not perform this action",400);
        }
        
    }
    catch(error){
        next(error);
    }
    
}
export const cancel_travelRequest = async (req, res, next) =>{
    const { travel_request_id, action } = req.body;
    const decoded = await getDataFromToken(req, res, next)

    try{
        if(action === 'cancel'){
            const userId = decoded.id;
            const findTravelRequest = await travelRequestServices.findItById({travelId:travel_request_id});
            if(findTravelRequest){
                if(findTravelRequest.userId === userId){

                    const changes = 'canceled';
                    if(findTravelRequest.status === 'pending'){
                        const updateStatus = await travelRequestServices.updateStatus({travelId:travel_request_id, status:changes});
                        if(updateStatus){
                            return res.status(201).json({status: 201, message:`Travel request canceled successfully!`});
                        }else{
                            throw new ApplicationError("Failed to cancel this travel request, try again!",500);
                        }
                    }else{
                        throw new BadRequestError(`Can not cancel this travel request, because it is ${findTravelRequest.status}`,400);
                    }
                    
                }else{
                    throw new ApplicationError(`Not allowed to cancel this travel request`,403);
                }
            }else{
                throw new NotFoundRequestError("The travel request does not exist!",404);
            }
        }
        
    }
    catch(error){
        next(error);
    }
    
}