import sqlite3

def run_migration():
    conn = sqlite3.connect('learnpath.db')
    c = conn.cursor()
    c.execute("PRAGMA table_info(topics)")
    cols = [col[1] for col in c.fetchall()]

    if 'description' not in cols:
        c.execute("ALTER TABLE topics ADD COLUMN description TEXT DEFAULT ''")
        print("Added description column to topics")

    if 'learning_objectives' not in cols:
        c.execute("ALTER TABLE topics ADD COLUMN learning_objectives TEXT DEFAULT ''")
        print("Added learning_objectives column to topics")

    conn.commit()
    conn.close()
    print("Migration finished successfully!")

if __name__ == '__main__':
    run_migration()
