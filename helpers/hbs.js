// const moment = require("moment");

// module.exports={
//     LikeState:(auth,likes)=>{
//         if(auth=likes){
//             return true;
//         }else{
//             return false;
//         }
//     }
// }

const moment = require("moment");

module.exports = {
  generateDate: (date, format) => {
    return moment(date).format(format);
  },
  limit: (arr, limit) => {
    if (!Array.isArray(arr)) {
      return [];
    }
    return arr.slice(0, limit);
  },
  truncate: (str, len) => {
    if (str.length > len) str = str.substring(0, len) + "...";
    return str;
  },
  paginate: (options) => {
    let outputHtml = "";
    if (options.hash.current == 1) {
      outputHtml += `<li class="page-item disabled"><a class="page-link">First</a></li>`;
    } else {
      outputHtml += `<li class="page-item"><a class="page-link" href="?page=1">First</a></li>`;
    }
    let i =
      Number(options.hash.current) > 5 ? Number(options.hash.current) - 3 : 1;
    if (i != 1) {
      outputHtml += `<li class="page-item disabled"><a class="page-link">...</a></li>`;
    }
    for (;i <= Number(options.hash.current) + 3 && i <= options.hash.pages;i++) {
      if (i === options.hash.current) {
        outputHtml += `<li class="page-item active"><a class="page-link" href="?page=1">${i}</a></li>`;
      } else {
        outputHtml += `<li class="page-item"><a class="page-link" href="?page=${i}">${i}</a></li>`;
      }
      if(i===Number(options.hash.current)+3 && i<options.hash.pages){
        if (options.hash.current == 1) {
          outputHtml += `<li class="page-item disabled"><a class="page-link" >...</a></li>`;
        } 
      }
    }
    if (options.hash.current == options.hash.pages) {
      outputHtml += `<li class="page-item disabled"><a class="page-link">Last</a></li>`;
    } else{
      outputHtml += `<li class="page-item"><a class="page-link" href=${options.hash.pages}>Last</a></li>`;
    }

    return outputHtml;
  },
};
