module.exports = (app) => {
  const db = app.get('db');
  const { cards } = db;
  const module = {};

  // Create
  module.create = async (user, row) => {
    if (!row) throw new Error('No row data given');
    delete row.id;
    return cards.save({ ...row, user_id: user.uid });
  };

  // Get all
  module.get = async (user) =>  {
    // get all cards for a user based on uid
    const uid = user.uid;
    const data = await cards.find({ user_id: uid });

    return data;
  };

  // Get all cards for a user, only if their due date is less than or equal to the current date
  module.getDueCards = async (user) => {
    const uid = user.uid;
    // SQL query directly compares `due_date` to the current timestamp
    const query = `
      SELECT * FROM cards 
      WHERE user_id = $1 AND due_date <= CURRENT_TIMESTAMP
    `;
    const data = await db.query(query, [uid]);
    return data;
  };

  // Update
  module.update = async (id, row) => {
    if (!Number(id)) throw new Error('No id given');
    row.id = id;
    return cards.save(row);
  };

  // Delete
  module.delete = async (id) => {
    if (!Number(id)) throw new Error('No id given');
    return cards.destroy({ id });
  };

  return module;
};
