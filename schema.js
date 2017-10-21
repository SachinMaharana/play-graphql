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
        // console.log(xml.GoodreadsResponse.user[0].user_statuses[0].user_status);
        return xml.GoodreadsResponse.user[0].user_statuses[0].user_status;
      }
    },
    read: {
      type: new GraphQLList(ReadType),
      resolve: () => {
        let url = `https://www.goodreads.com/review/list/10596512.xml?key=WrPwyxBPMtPbEX5zMkThWQ&v=2&shelf=read&sort=date_updated&page=1&per_page=75`;
        let result = fetch(url);
        return result
          .then(res => {
            return res.text();
          })
          .then(res => parseXml(res))
          .then(x => {
            // console.log(x.GoodreadsResponse.reviews[0].review);
            return x.GoodreadsResponse.reviews[0].review;
          });
      }
    },
    currentReading: {
      type: new GraphQLList(ReadType),
      resolve: () => {
        let url = `https://www.goodreads.com/review/list/10596512.xml?key=WrPwyxBPMtPbEX5zMkThWQ&v=2&shelf=currently-reading&sort=date_updated&page=1&per_page=10`;
        let result = fetch(url);
        return result
          .then(res => {
            return res.text();
          })
          .then(res => parseXml(res))
          .then(x => {
            // console.log(x.GoodreadsResponse.reviews[0].review);
            return x.GoodreadsResponse.reviews[0].review;
          });
      }
    }
  })
});

const ReadType = new GraphQLObjectType({
  name: "ReadType",
  description: "...",
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: xml => {
        // console.log(xml.review);
        return xml.id[0];
      }
    },
    book: {
      type: BookStatusType,
      resolve: xml => {
        return xml.book[0];
      }
    }
  })
});

const Status = new GraphQLObjectType({
  name: "Status",
  description: "...",
  fields: () => ({
    id: {
      type: GraphQLString,
      resolve: xml => {
        return xml.id[0]._;
      }
    },
    percentRead: {
      type: GraphQLString,
      resolve: xml => {
        // console.log(xml);
        return xml.percent[0]._;
      }
    },
    book: {
      type: BookStatusType,
      resolve: xml => {
        return xml.book[0];
      }
    }
  })
});

const BookStatusType = new GraphQLObjectType({
  name: "BookStatus",
  description: "...",
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => {
        console.log(xml);
        return xml.title[0];
      }
    },
    numPages: {
      type: GraphQLString,
      resolve: xml => {
        return xml.num_pages[0]._;
      }
    },
    authors: {
      type: GraphQLString,
      resolve: xml => {
        return xml.authors[0].author[0].name[0];
      }
    },
    link: {
      type: GraphQLString,
      resolve: xml => {
        return xml.link[0];
      }
    },
    numOfPages: {
      type: GraphQLString,
      resolve: xml => {
        return xml.num_pages[0];
      }
    },
    publicationYear: {
      type: GraphQLString,
      resolve: xml => {
        return xml.publication_year[0];
      }
    },
    averageRating: {
      type: GraphQLString,
      resolve: xml => {
        return xml.average_rating[0];
      }
    },
    ratingCount: {
      type: GraphQLString,
      resolve: xml => {
        return xml.ratings_count[0];
      }
    },
    description: {
      type: GraphQLString,
      resolve: xml => {
        return xml.description[0];
      }
    }
  })
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

// {
//   user(id: 10596512) {
//     name
//     lastActive
//     friendsNo
//     reviewsCount
//     userShelves {
//       read
//       currentlyReading
//       toRead
//     }
//     userStatus {
//       percentRead
//       book {
//         title
//         numPages
//         authors
//       }
//     }
// read {
//   book {
//     title
//     numOfPages
//     authors
//     link
//     publicationYear
//     averageRating
//     ratingCount
//     description
//   }
// }

//   }
// }
// https://www.goodreads.com/review/list/10596512.xml?key=WrPwyxBPMtPbEX5zMkThWQ&v=2&shelf=read&sort=date_updated&page=1&per_page=75

// const UserStype = new GraphQLObjectType({
//   name: "User",
//   description: "....User",
//   field: () => {
//     name: {
//       type: GraphQLString;
//       resolve: xml => {
//         // console.log(xml.GoodreadsResponse);
//         xml.GoodreadsResponse;
//       };
//     }
//   }
// });

/* 
{
  user(id: 10596512) {
    name
    lastActive
    friendsNo
    reviewsCount
    userShelves {
      read
      currentlyReading
      toRead
    }
    userStatus {
      percentRead
      book {
        title
        numPages
        authors
      }
    }
    read {
      book {
        title
        numOfPages
        authors
        link
        publicationYear
        averageRating
        ratingCount
        description
      }
    }
    currentReading {
      book {
        title
        numOfPages
        authors
        link
        publicationYear
        averageRating
        ratingCount
        description
      }
    }
  }
}

*/
