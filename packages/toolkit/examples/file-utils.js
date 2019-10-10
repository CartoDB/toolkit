function getFile(rows = 7) {
  const contents = ['id,name'];

  for (var i = 0; i < rows; i++) {
    contents.push(`${i},A`);
  }

  return contents.join('\n');
}

async function copyFile(rows = 7) {
  await sql.create('copy_test', ['id numeric', 'name text'], {
    ifNotExists: true
  });

  await sql.query('truncate copy_test');

  const file = getFile(rows);

  const result = await sql.copyFrom(file, 'copy_test', ['id', 'name']);

  console.log(result);

  const data = await sql.query('SELECT * FROM copy_test LIMIT 100');

  return data;
}
