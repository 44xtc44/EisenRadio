DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS eisen_intern;
CREATE TABLE "posts" (
	"id"	INTEGER,
	"created"	TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"title"	TEXT NOT NULL,
	"content"	TEXT NOT NULL,
	"download_path"	TEXT,
	"display"	TEXT,
	"pic_data"	TEXT,
	"pic_name"	TEXT,
	"pic_comment"	TEXT,
	"pic_content_type"	TEXT,
	"search_pattern_history"	TEXT,
	"favorites_up" TEXT,
	"future1" TEXT,
	"future2" TEXT,
	"future3" TEXT,
	"future4" TEXT,
	"future5" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "eisen_intern" (
	"id"	INTEGER NOT NULL,
	"browser_open"	INTEGER NOT NULL,
	"custom_pic_size"	TEXT,
	"favorites_up_master" TEXT,
	"statistics"	TEXT,
	"commercials"	TEXT,
	"dump_db_html_print" TEXT,
	"dump_db_json_dict" TEXT,
	"future1" TEXT,
	"future2" TEXT,
	"future3" TEXT,
	"future4" TEXT,
	"future5" TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE user (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  profile TEXT,
  avatar TEXT,
  text	TEXT,
  content_dict TEXT
  future1 TEXT,
  future2 TEXT,
  future3 TEXT,
  future4 TEXT,
  future5 TEXT
);