import path from 'path';
import { fileURLToPath } from 'url';

import db from '../models/db.js';
import collection from '../models/schemas.js';
import { User , Course, College, Post, Profs} from '../models/schemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const controller = {

    /*
        Use this to display the home.html page by sending an HTTP GET.
    */
    getHome: (req, res) => {
        res.sendFile('pages/home.html', {root: __dirname});
    },

    /*
        Use this to display the courses.html page by sending an HTTP GET.
        Not to be confused with findCourses function.
    */
    getCourses: (req, res) => {
        res.sendFile('pages/courses.html', {root: __dirname});
    },

    /*
        Use this to display the profs.html page by sending an HTTP GET.
    */
    getProfs: (req, res) => {
        res.sendFile('pages/profs.html', {root: __dirname});
    },

    /*
        Use this when a new user registers into the application.
        Use HTTP POST method.
    */
    addUser: (req, res) => {

    },

    /*
        Use when submitting a post review.
        Use HTTP POST method 
    */
    addPost: (req, res) => {

    },

    /*
        Use when user presses the follow button on a course.
        Use HTTP GET method.
    */
    followCourse: (req, res) => {
        db.updateOne(collection['users'], req.query['filter'], req.query['update'], (result) => {
            //console.log('result:', result);
        });
    },

    /*
        Use when user presses the like button on a post
        Use HTTP GET method
        Same goes for unlikePost function.
    */
    likePost: (req, res) => {

    },

    unlikePost: (req, res) => {

    },

    /*
        @param req - request object; this is where the URL passed from main.js through the FETCH API is going to be stored
        @param res - response object; this is what getCourseTable is eventually going to give back to main.js
        @ let id - the ID of the 'event' from main.js is going to be queried and stored here
        @ let table - HTML code for the first portion of the course table in String format
        @ let newRow - where new rows of the 'table' String will be stored; its value will always change via a for-loop
        @ let courses - where all of the course documents from the database will be stored
    */

    getCourseTable: (req, res) => {
        console.log("GET: /getCourseTable");
        let id = req.query.collegeid;
        let table = 
                `   <br>
                    <table id="course-table">
                    <th colspan="2">COURSE NAME</th>
                    <th>Units</th>
                `;
        let newRow;
        let courses;

        /* We use the find() function of MongoDB to get all of the courses recorded in the database
            @param {collegeid:{$eq:id}} - "get all courses with the 'collegeid' equal to 'id'"
                                            - The collegeid field in the Courses database tells you what college it belongs to
                                                1 - CLA
                                                2 - COS
                                                3 - GCOE
                                                4- RVCOB
                                                5- SOE
                                                6 - BAGCED
                                                7 - CCS
                                                8 - GE subject
            @param "coursename coursecode units collegeid" - this is the "projection" parameter; this tells mongodb what parts of the courses documents that we want
            @param function(err, result) - the callback function; this is where all of the processing is going to happen
        */
        Course.find({collegeid:{$eq:id}}, "coursename coursecode units collegeid", function(err, result){
            if (err) {
                console.error(err);
            }
            else {
                courses = result;
                console.log("Courses gathered: ");
                console.log("---------------------");
                console.log(courses);
                console.log("---------------------");

                // a new table row (<tr> ... </tr) HTML string is going to be written and concatenated to the main 'table' string for every iteration of the for-loop
                for(let i = 0; i < courses.length; i++){
                    newRow = 
                    `
                        <tr>
                            <td width="108"><button class='courseCodeBtn' id='${courses[i].collegeid}' name='${courses[i].coursecode}'>${courses[i].coursecode}</button></td>
                            <td width="402">${courses[i].coursename}</td>
                            <td style="text-align: center;" width="114">${courses[i].units}</td>
                        </tr>
                    `;
                    table = table.concat(newRow);
                }
                table = table.concat("</table>"); // once all the rows are written, the "</table" string is concatenated to end the table
                console.log(table);

                res.status(200).send({
                    message: table //getCourseTable sends back the 'table' string to main.js along with a status code of 200 (OK)
                });
            }
        });
    },

    /*
        @param req - request object; this is where the URL passed from main.js through the FETCH API is going to be stored
        @param res - response object; this is what getCourseTable is eventually going to give back to main.js
        @let code - the course code gathered from the URL sent by main.js
        @let reviewsContainer - HTML string of the first portion of the course reviews
        @let newMainPost - where HTML strings of new mainpost divs will be stored
        @let reviews - where Post documents from the database will be stored
        @let stars - the number of stars of a certain review post; this is going to come from the database
        @let starsString - the actual star characters; note that "<meta charset="UTF-8">" is needed in courses.html to make it appear in the webpage (it's already there, don't worry)
        @let starsLegend - the meaning of the number of star characters (i.e., "Excellent", "DO NOT TAKE")
        In terms of how it works, this function is nearly identical to getCourseTable. The only difference is that a switch case is executed for each for-loop iteration to determine
        the number of star characters and star legend to be printed on the webpage.
    */

    getCourseReviews: (req, res) => {
        console.log("GET: /getCourseReviews");
        let code = req.query.coursecode;
        let reviewsContainer = 
        `
            <div class="coursePostContainer">
        `
        let newMainPost;
        let reviews;
        let stars
        let starsString;
        let starsLegend;

        Post.find({reviewCourse:{$eq:code}}, function(err, result){
            if(err){
                console.error(err);
            }
            else {
                reviews = result;
                console.log(`Reviews gathered for ${code}`);
                console.log("---------------------");
                console.log(reviews);
                console.log("---------------------");

                for(let i = 0; i < reviews.length; i++){
                    stars = reviews[i].reviewRating;
                    switch (stars) {
                        case 1:
                                starsString = "★";
                                starsLegend = "DO NOT TAKE";
                                break;
                        case 2:
                                starsString = "★★";
                                starsLegend = "Poor";
                                break;
                        case 3:
                                starsString = "★★★";
                                starsLegend = "Average";
                                break;
                        case 4:
                                starsString = "★★★★";
                                starsLegend = "Good";
                                break;
                        case 5:
                                starsString = "★★★★★";
                                starsLegend = "Excellent";
                                break;
                    }

                    newMainPost = 
                    `
                    <div class="mainpost">
                        <div class="mp-header">
                            <div class="mp-header-left">
                                Review For:
                            </div>
                            <div class="mp-header-middle">
                                <div class="mp-header-middle-top">${reviews[i].reviewForFN} ${reviews[i].reviewForLN}</div>
                                <div class="mp-header-middle-bottom">${reviews[i].reviewCourse} | ${reviews[i].reviewTerm}</div>
                            </div>
                        </div>
                        <div class="mp-review">
                            <div class="mp-review-stars">
                                ${starsString}
                            </div>
                            <div class="mp-rev-description">
                                ${starsLegend}
                            </div>
                        </div>
                        <div class="mp-review-box">
                            ${reviews[i].reviewText}
                        </div>
                        <div class="mp-subheader">
                            <img class="mp-subheader-pic" src="${reviews[i].posterPfp}" alt="pic">
                            <div class="mp-subheader-left">
                                <div class="mp-subheader-left-top">
                                    ${reviews[i].posterNameFN} ${reviews[i].posterNameLN}
                                </div>
                                <div class="mp-subheader-left-bottom">
                                    ${reviews[i].posterDegCode} | ${reviews[i].posterCollege}
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                    reviewsContainer = reviewsContainer.concat(newMainPost);
                }
                reviewsContainer = reviewsContainer.concat("</div>"); // "</div>" is concatenated to end the div
                console.log(reviewsContainer);

                res.status(200).send({
                    message: reviewsContainer //sends the reviewsContainer string to main.js along with a status code of 200 (OK)
                });
            }
        });
    },

    /*=====================================================*/
    /*   Functions below to retrieve and manipulate documents from the db.
    /*   Responds with document objects.
    /*   Use HTTP GET requests for funcs below.
    /*=====================================================*/

    /* Use to find a course */
    findCourse: (req, res) => {
        db.findOne(collection['courses'], req.query['filter'], req.query['projection'], (result) => {
            //console.log("findCourse result", result);
            res.send(result);                           // Sends the course document found as a response                    
        });
    },

    /* Plural version of findCourse */
    findCourses: (req, res) => {
        db.findMany(collection['courses'], req.query['filter'], req.query['projection'], (result) => {
            //console.log("findCourses result", result);
            res.send(result);
        });
    },

    /* Find a college */
    findCollege: (req, res) => {
        db.findOne(collection['colleges'], req.query['filter'], req.query['projection'], (result) => {
            //console.log("findCollege result", result);
            res.send(result);
        });
    },

    /* Find colleges */
    findColleges: (req, res) => {
        db.findMany(collection['colleges'], req.query['filter'], req.query['projection'], (result) => {
            //console.log("findColleges result", result);
            res.send(result);
        });
    },

    /* 
        Find a user; Use this for logging in.
    */
    findUser: (req, res) => {
        db.findOne(collection['users'], req.query['filter'], req.query['projection'], (result) => {
            //console.log("findUser result", result);
            res.send(result);
        });
    },

    /* Find multiple users*/
    findUsers: (req, res) => {
        db.findMany(collection['users'], req.query['filter'], req.query['projection'], (result) => {
            //console.log("findUsers result", result);
            res.send(result);
        });
    },
    
    /* Find a post */
    findPost: (req, res) => {
        db.findOne(collection['posts'], req.query['filter'], req.query['projection'], (result) => {
            //console.log("findPost result", result);
            res.send(result);
        });
    },

    findPosts: (req, res) => {
        db.findMany(collection['posts'], req.query['filter'], req.query['projection'], (result) => {
            //console.log("findPosts result", result);
            res.send(result);
        });
    },

    login: (req, res) => {
        var params = new URLSearchParams(req.url.substring("/login?".length));
        console.log(params.get("username"));
    },

    //Inputs sample data into the DB
    fillDB: (req, res) => {
        // Generate Sample Data
        /*
        collection['courses'].insertMany([
            {
                name: 'CCPROG',
                college: 'CCS'
            },
            {
                name: 'CCPROG2',
                college: 'CCS'
            },
            {
                name: 'CCDSTRU',
                college: 'CCS'
            },
            {
                name: 'CSINTSY',
                college: 'CCS'
            },
            {
                name: 'KEMPSY1',
                college: 'COS'
            }
        ], (err, res) => {
            if(err) console.log('Insert error occured for Courses, possible duplicates');
            else console.log('Course Data Added');
        });

        collection['colleges'].insertMany([
            {
                name: 'College of Computer Studies',
                id: 'CCS'
            },
            {
                name: 'College of Science',
                id: 'COS'
            }
        ], (err, res) => {
            if(err) console.log('Insert error occured for Colleges, possible duplicates');
            else console.log('College Data Added');
        });

        collection['users'].insertMany([
            {
                firstName: 'Harley',
                lastName: 'Davis',
                degree: 'BSCS',
                college: { name: 'College of Computer Studies', id: 'CCS'},
                batch: 'ID 120',
                username: 'HDavis',
                password: 'user1',
                img: '/img/user1.jpg',
                followedCourses: [{ name: 'CCPROG', college: 'CCS' }, { name: 'CSINTSY', college: 'CCS' }],
                likedPosts: [100001]
            },
            {
                firstName: 'Sarah',
                lastName: 'Parker',
                degree: 'BSCS',
                college: { name: 'College of Computer Studies', id: 'CCS'},
                batch: 'ID 119',
                username: 'Sarah',
                password: 'user2',
                img: '/img/user2.jpg'
            },
            {
                firstName: 'Amy',
                lastName: 'Bougainvillea',
                degree: 'BSCS',
                college: { name: 'College of Computer Studies', id: 'CCS'},
                batch: 'ID 120',
                username: 'Amivillea',
                password: 'user3',
                img: '/img/user3.jpg'
            },
            {
                firstName: 'Lance',
                lastName: 'Mendoza',
                degree: 'BSCS',
                college: { name: 'College of Computer Studies', id: 'CCS'},
                batch: 'ID 12',
                username: 'LanDoza',
                password: 'user4',
                img: '/img/user4.jpg'
            },
            {
                firstName: 'Mad',
                lastName: 'Scientist',
                degree: 'BSBC',
                college: { name: 'College of Science', id: 'COS'},
                batch: 'ID 118',
                username: 'MaddoScientisto',
                password: 'user5',
                img: '/img/empty-profile-pic.jpeg'
            }
        ], (err, res) => {
            if(err) console.log('Insert error occured for Users, possible duplicates');
            else console.log('User Data Added');
        });

        collection['posts'].insertMany([
            {
                profFName: 'Porter',
                profLName: 'Newman',
                text: 'Prof is entertaining, also grades high, strongly recommend!',
                course: 'CCPROG',
                term: 2,
                stars: 5,
                owner: { 
                    firstName: 'Sarah',
                    lastName: 'Parker',
                    degree: 'BSCS',
                    college: { name: 'College of Computer Studies', id: 'CCS'},
                    batch: 'ID 119',
                    username: 'Sarah',
                    password: 'user2',
                    img: '/img/user2.jpg' 
                },
                id: 100001
            },
            {
                profFName: 'Henry',
                profLName: 'Ford',
                text: 'Very good lectures, always late tho but still recommend',
                course: 'CCDSTRU',
                term: 1,
                stars: 4,
                owner: {
                    firstName: 'Amy',
                    lastName: 'Bougainvillea',
                    degree: 'BSCS',
                    college: { name: 'College of Computer Studies', id: 'CCS'},
                    batch: 'ID 120',
                    username: 'Amivillea',
                    password: 'user3',
                    img: '/img/user3.jpg'
                },
                id: 100002
            },
            {
                profFName: 'Farah',
                profLName: 'Boeing',
                text: 'Their internet is slow lol, but alright overall',
                course: 'CCPROG2',
                term: 2,
                stars: 3,
                owner: {
                    firstName: 'Amy',
                    lastName: 'Bougainvillea',
                    degree: 'BSCS',
                    college: { name: 'College of Computer Studies', id: 'CCS'},
                    batch: 'ID 120',
                    username: 'Amivillea',
                    password: 'user3',
                    img: '/img/user3.jpg'
                },
                id: 100003
            },
            {
                profFName: 'Jack',
                profLName: 'Frost',
                text: 'Gives a lot of assignments, but good prof, thats my only complaint',
                course: 'CCPROG',
                term: 1,
                stars: 4,
                owner: {
                    firstName: 'Lance',
                    lastName: 'Mendoza',
                    degree: 'BSCS',
                    college: { name: 'College of Computer Studies', id: 'CCS'},
                    batch: 'ID 12',
                    username: 'LanDoza',
                    password: 'user4',
                    img: '/img/user4.jpg'
                },
                id: 100004
            },
            {
                profFName: 'Albert',
                profLName: 'Einstein',
                text: 'The chem laboratory blew up because of them but they teach great',
                course: 'KEMPSY1',
                term: 1,
                stars: 5,
                owner: {
                    firstName: 'Mad',
                    lastName: 'Scientist',
                    degree: 'BSBC',
                    college: { name: 'College of Science', id: 'COS'},
                    batch: 'ID 118',
                    username: 'MaddoScientisto',
                    password: 'user5',
                    img: '/img/empty-profile-pic.jpeg'
                },
                id: 100005
            }
        ], (err, res) => {
            if(err) console.log('Insert error occured for Posts, possible duplicates');
            else console.log('Post Data Added');
        });
        */

        /*========================================================*/
        /* Sample Data*/
        /* This will be the sample data to be used for all testing.
        /*  Un-comment this when it's your first time running this code.
        /*  Afterwards, comment it again to prevent data duplication.
        /*========================================================*/

        // NOTE: for some reason, the console.logs of all code below don't work for some reason but the data is added to the database when you check MongoDBCompass

        /* TODO */
        //Async communication with DB
        async function fillDB()
        {
            //Used to prevent duplicates, might need to be removed
            await collection["colleges"].deleteMany();
            await collection["courses"].deleteMany();
            await collection["posts"].deleteMany();
            await collection["profs"].deleteMany();
            await collection["users"].deleteMany();

            // Sample Users - fill up at least 4 more sample users
            await collection['users'].create({
                firstName: "Sarah",
                lastName: "Parker",
                degree: "AB Literature",
                degreeCode: "ABLIT",
                college: "College of Liberal Arts",
                batch: "118",
                username: "Sarah Parker",
                password: "12345",
                img: "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg",
                followedCourses: ["GEUSELF", "POLGOVT"],
                likedPosts: [1201, 1202]
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    console.log("User Sarah Parker saved to database")
                }
            }

            /* TODO */
            // Sample Posts - fill up at least 3 more posts
            await collection['posts'].create({
                id: 1201,
                reviewForFN: "Nicole",
                reviewForLN: "Zefanya",
                reviewCourse: "GEUSELF",
                reviewTerm: "Term 2",
                reviewRating: 5,
                reviewText: "Prof is entertaining",
                posterNameFN: "Elliot",
                posterNameLN: "Alderson",
                posterPfp: "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg",
                posterDegCode: "BSCS",
                posterCollege: "College of Computer Studies",
                likesNum: 3,
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    console.log("Post 1201 saved to database");
                }
            }
            await collection['posts'].create({
                id: 1202,
                reviewForFN: "Hwang",
                reviewForLN: "Yeji",
                reviewCourse: "POLGOVT",
                reviewTerm: "Term 2",
                reviewRating: 5,
                reviewText: "Heavy workload but her teaching makes it very easy to accomplish",
                posterNameFN: "John",
                posterNameLN: "Dela Rosa",
                posterPfp: "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg",
                posterDegCode: "ABPOM",
                posterCollege: "College of Liberal Arts",
                likesNum: 3,
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    console.log("Post 1201 saved to database");
                }
            }
            await collection['posts'].create({
                id: 1203,
                reviewForFN: "Nicole",
                reviewForLN: "Zefanya",
                reviewCourse: "GEUSELF",
                reviewTerm: "Term 2",
                reviewRating: 4,
                reviewText: "She often gives essays as assignments which are easy to do if you just listen to her lectures.",
                posterNameFN: "Sarah",
                posterNameLN: "Parker",
                posterPfp: "https://icon-library.com/images/default-profile-icon/default-profile-icon-24.jpg",
                posterDegCode: "ABLIT",
                posterCollege: "College of Liberal Arts",
                likesNum: 3,
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    console.log("Post 1201 saved to database");
                }
            }

            // Sample Profs - there are 8 profs for each of the 8 courses in the database
            await collection['profs'].create({
                firstName: "Hwang",
                lastName: "Yeji",
                img: "https://kpopping.com/documents/91/4/1500/220411-ITZY-Yeji1st-Fanmeeting-Photoshoot-by-Dispatch-documents-1.jpeg?v=52dbc",
                position: "Assisant Prof. Lecturer",
                department: "Political Science",
                degree: "AB Political Science",
                college: "De La Salle University",
                course: "POLGOVT",
                avgRating: 4.5,
                gradYear: 2015,
                expYears: 2
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Prof. Hwang Yeji saved to database");
            }
            await collection['profs'].create({
                firstName: "Choi",
                lastName: "Jisu",
                img: "https://i.pinimg.com/736x/45/48/db/4548db5f7f80e5abcf0ad638b6d80f18.jpg",
                position: "Associate Professor",
                department: "Chemistry",
                degree: "BS Chemistry",
                college: "De La Salle University",
                course: "KEMPRN1",
                avgRating: 4.2,
                gradYear: 2016,
                expYears: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Prof. Choi Jisu saved to database");
            }
            await collection['profs'].create({
                firstName: "Lee",
                lastName: "Chaeryeong",
                img: "https://i.mydramalist.com/wRvyN_5f.jpg",
                position: "Lecturer",
                department: "Engineering",
                degree: "MS Mechanical Engineering",
                college: "De La Salle University",
                course: "GRAPONE",
                avgRating: 4.3,
                gradYear: 2017,
                expYears: 2 
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Prof. Lee Chaeryeong saved to database");
            }
            await collection['profs'].create({
                firstName: "Shin",
                lastName: "Ryujin",
                img: "https://i.pinimg.com/736x/a0/12/53/a0125307be33e84f2446e16df7781c59.jpg",
                position: "Lecturer",
                department: "Accountancy",
                degree: "BS Accountancy",
                college: "De La salle University",
                course: "FDNACCT",
                avgRating: 4.6,
                gradYear: 2017,
                expYears: 1
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Prof. Shin Ryujin saved to database");
            }
            await collection['profs'].create({
                firstName: "Shin",
                lastName: "Yuna",
                img: "https://i.mydramalist.com/2V2Zk_5f.jpg",
                position: "Associate Professor",
                department: "Economics",
                degree: "BS Applied Economics",
                college: "De La Salle University",
                course: "ECONONE",
                avgRating: 4.3,
                gradYear: 2018,
                expYears: 1
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Prof. Shin Yuna saved to database");
            }
            await collection['profs'].create({
                firstName: "George",
                lastName: "Miller",
                img: "https://miro.medium.com/max/500/1*WayO-bj4vW59rCNrkSbjTg.jpeg",
                position: "Lecturer",
                department: "English",
                degree: "BS Secondary Education",
                college: "De La Salle University",
                course: "ENGLCOM",
                avgRating: 4.1,
                gradYear: 2013,
                expYears: 5
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Prof. George Miller saved to database");
            }
            await collection['profs'].create({
                firstName: "Brian",
                lastName: "Soewarno",
                img: "https://upload.wikimedia.org/wikipedia/en/c/c6/Amen_RichBrian.jpg",
                position: "Lecturer",
                department: "Software Technology",
                degree: "BS Computer Science",
                college: "De La Salle University",
                course: "CCAPDEV",
                avgRating: 4.0,
                gradYear: 2017,
                expYears: 1
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Prof. Brian Soewarno saved to database");
            }
            await collection['profs'].create({
                firstName: "Nicole",
                lastName: "Zefanya",
                img: "https://pbs.twimg.com/profile_images/1515733643368415232/uFPui6Do_400x400.jpg",
                position: "Lecturer",
                department: "General Education",
                degree: "BS Psychology",
                college: "De La Salle University",
                course: "GEUSELF",
                avgRating: 4.5,
                gradYear: 2016,
                expYears: 2
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Prof. Nicole Zefanya saved to database");
            }

            // Sample Colleges - there are 7 main colleges in DLSU and they are assigned their respective IDs;
            //                   GE is considered its own college for this website
            await collection['colleges'].create({
                collegename: "College of Liberal Arts",
                name: "CLA",
                id: 1
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("College 1 saved to database");
            }
            await collection['colleges'].create({
                collegename: "College of Computer Studies",
                name: "COS",
                id: 2
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("College 1 saved to database");
            }
            await collection['colleges'].create({
                collegename: "Gokongwei College of Engineering",
                name: "GCOE",
                id: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("College 1 saved to database");
            }
            await collection['colleges'].create({
                collegename: "Ramon V. Del Rosario College of Business",
                name: "RVCOB",
                id: 4
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("College 1 saved to database");
            }
            await collection['colleges'].create({
                collegename: "School of Economics",
                name: "SOE",
                id: 5
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("College 1 saved to database");
            }
            await collection['colleges'].create({
                collegename: "Brother Andrew Gonzalez College of Education",
                name: "BAGCED",
                id: 6
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("College 1 saved to database");
            }
            await collection['colleges'].create({
                collegename: "College of Computer Studies",
                name: "CCS",
                id: 7
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("College 1 saved to database");
            }

            // Sample Courses - there are 8 sample courses; 7 courses (for 7 colleges) + 1 GE course
            await collection['courses'].create({
                coursename: "Philippine Politics and Government",
                coursecode: "POLGOVT",
                collegeid: 1,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 1 saved to database");
            }
            await collection['courses'].create({
                coursename: "Principles of Chemistry 1",
                coursecode: "KEMPRN1",
                collegeid: 2,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 2 saved to database");
            }
            await collection['courses'].create({
                coursename: "Engineering Graphics 1",
                coursecode: "GRAPONE",
                collegeid: 3,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 3 saved to database");
            }
            await collection['courses'].create({
                coursename: "Fundamentals of Accountancy, Business, and Management",
                coursecode: "FDNACCT",
                collegeid: 4,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 4 saved to database");
            }
            await collection['courses'].create({
                coursename: "Basic Microeconomics",
                coursecode: "ECONONE",
                collegeid: 5,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 5 saved to database");
            }
            await collection['courses'].create({
                coursename: "Basic Communication and Study Skills",
                coursecode: "ENGLCOM",
                collegeid: 6,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 6 saved to database");
            }
            await collection['courses'].create({
                coursename: "Web Application Development",
                coursecode: "CCAPDEV",
                collegeid: 7,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 7 saved to database");
            }
            await collection['courses'].create({
                coursename: "Understanding the Self",
                coursecode: "GEUSELF",
                collegeid: 8,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 8 saved to database");
            }
            await collection['courses'].create({
                coursename: "Readings in Philippine History",
                coursecode: "GERPHIS",
                collegeid: 8,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 9 saved to database");
            }
            await collection['courses'].create({
                coursename: "The Contemporary World",
                coursecode: "GEWORLD",
                collegeid: 8,
                units: 3
            }), (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("Course 10 saved to database");
            }
        }
        fillDB();

        // remove "/*" to uncomment

        /*========================================================*/
        /* END OF SAMPLE DATA */
        /*========================================================*/
    }
}

export default controller;