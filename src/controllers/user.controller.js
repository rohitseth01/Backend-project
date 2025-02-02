
import {asyncHandler}  from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"


const registerUser =asyncHandler(async (req,res)=>{
    //get user details from fronted-- also done bypostman 
    //validation -username,meail,.. -empty
    //check if user already exists:username,email
    //check for images,check for avatr
    //upload them to cloudinary --response me url nikalkana hai
    //cloudinary me avatar check
    //create user object -create entry in db 
    //remove password and  refresh token field from response
    //check for user creation 
    //return res
    //above is logic buildings for register user
    
    //req body ke andar hamara  data aa rha hai
    const {fullName,email,username,password}=req.body
    console.log("email:",email);

    //ab valiadation karna hai
    if(
        [fullName,email,username,password].some((field)  =>
        field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required")
    }

    //user  mongo ke through ham uske details ko verify karenge

    const existedUser=User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exits")
    }

    //image,avatar ko check karenge -multer ke through ham file stored karenge

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;
    
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required");
    }

    //upload karna hai cloudinary me -avatar aor cover image ko 
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    //avatart ko check karo

    if(!avatar){
        throw new ApiError(400,"Avatar file is required");
    }

    //database me entry ek liye hamaare pass sirf User function hi hai toh
    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    //user bana hai ya nhi,mongodb id create kar dega jab user create hoat hai
    //select ke through ham password aor refreshtoken ko remove kar denge database me se
    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registring user ")
    }

    //ab user ko response ke thorugh ham bhej denge

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully")
    )


})

export {registerUser}