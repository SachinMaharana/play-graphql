const fetch = require("node-fetch");
const util = require("util");
const parseXml = util.promisify(require("xml2js").parseString);
const {
  GraphQLInt,
  GraphQLString,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList
} = require("graphql");

const Id = 10596512;

const BookType = new GraphQLObjectType({
  name: "Book",
  description: "...",
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => xml.title[0]
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => xml.isbn[0]
    }
  })
});

const userShelf = new GraphQLObjectType({
  name: "UserShelf",
  description: "...",
  fields: () => ({
    read: {
      type: GraphQLString,
      resolve: xml => {
        return xml.user_shelf[0].book_count[0]._;
      }
    },
    currentlyReading: {
      type: GraphQLString,
      resolve: xml => {
        return xml.user_shelf[1].book_count[0]._;
      }
    },
    toRead: {
      type: GraphQLString,
      resolve: xml => {
        return xml.user_shelf[2].book_count[0]._;
      }
    }
  })
});

const UserType = new GraphQLObjectType({
  name: "User",
  description: "...",
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => {
        return xml.GoodreadsResponse.user[0].name[0];
      }
    },
    image: {
      type: GraphQLString,
      resolve: xml => {
        return xml.GoodreadsResponse.user[0].image_url[0];
      }
    },
    lastActive: {
      type: GraphQLString,
      resolve: xml => {
        return xml.GoodreadsResponse.user[0].last_active[0];
      }
    },
    friendsNo: {
      type: GraphQLString,
      resolve: xml => {
        return xml.GoodreadsResponse.user[0].friends_count[0]._;
      }
    },
    reviewsCount: {
      type: GraphQLString,
      resolve: xml => {
        return xml.GoodreadsResponse.user[0].reviews_count[0]._;
      }
    },
    userShelves: {
      type: userShelf,
      resolve: xml => {
        return xml.GoodreadsResponse.user[0].user_shelves[0];
      }
    },
    userStatus: {
      type: new GraphQLList(Status),
      resolve: xml => {
        console.log(xml.GoodreadsResponse.user[0].user_statuses[0].user_status);
        return xml.GoodreadsResponse.user[0].user_statuses[0].user_status;
      }
    }
  })
});

const Status = new GraphQLObjectType({
  name: "Status",
  description: "...",
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => xml.title[0]
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => xml.isbn[0]
    }
  })
});

const UserStype = new GraphQLObjectType({
  name: "User",
  description: "....User",
  field: () => {
    name: {
      type: GraphQLString;
      resolve: xml => {
        console.log(xml.GoodreadsResponse);
        xml.GoodreadsResponse;
      };
    }
  }
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    description: "...",
    fields: () => ({
      user: {
        type: UserType,
        args: {
          id: {
            type: GraphQLInt
          }
        },
        resolve: (parentValue, args) => {
          let key = `WrPwyxBPMtPbEX5zMkThWQ`;
          let url = `https://www.goodreads.com/user/show/${args.id}.xml?key=${key}`;
          let result = fetch(url);
          return result.then(res => res.text()).then(parseXml);
        }
      }
    })
  })
});

// https://www.goodreads.com/user/show/${args.id}.xml?key=${key}

// user: {
//   type: UserStype,
//   args: {
//     id: {
//       type: GraphQLInt
//     }
//   },
//   resolve: (parentValue, args) => {
//     let key = `WrPwyxBPMtPbEX5zMkThWQ`;
//     let url = `https://www.goodreads.com/shelf/list.xml?key=${key}&id=${args.id}`;
//     let result = fetch(url);
//     return result.then(res => res.text()).then(parseXml);
//   }
// }
