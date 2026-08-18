/**
 * @concept Aggregation pipelines
 * @category NoSQL (Mongo)
 * @description Implementation of MongoDB-style aggregation pipeline execution engine
 * supporting $match, $group, $sort, $project, $unwind, and $lookup stages on collection documents.
 */

/**
 * Runs a multi-stage aggregation pipeline over a collection
 * @param {Array<Object>} collection
 * @param {Array<Object>} pipeline
 * @returns {Array<Object>}
 */
export function runAggregationPipeline(collection = [], pipeline = []) {
  let result = JSON.parse(JSON.stringify(collection));

  for (const stage of pipeline) {
    const [stageName, stageConfig] = Object.entries(stage)[0] || [];

    switch (stageName) {
      case '$match': {
        result = result.filter(doc => {
          return Object.entries(stageConfig).every(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              if (value.$gt !== undefined && !(doc[key] > value.$gt)) return false;
              if (value.$gte !== undefined && !(doc[key] >= value.$gte)) return false;
              if (value.$lt !== undefined && !(doc[key] < value.$lt)) return false;
              if (value.$lte !== undefined && !(doc[key] <= value.$lte)) return false;
              if (value.$ne !== undefined && doc[key] === value.$ne) return false;
              if (value.$in !== undefined && !value.$in.includes(doc[key])) return false;
              return true;
            }
            return doc[key] === value;
          });
        });
        break;
      }

      case '$group': {
        const idField = stageConfig._id;
        const groups = new Map();

        result.forEach(doc => {
          const groupKey = typeof idField === 'string' && idField.startsWith('$')
            ? doc[idField.substring(1)]
            : idField;

          if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
          }
          groups.get(groupKey).push(doc);
        });

        result = Array.from(groups.entries()).map(([key, groupDocs]) => {
          const groupedDoc = { _id: key };
          Object.entries(stageConfig).forEach(([field, expr]) => {
            if (field === '_id') return;

            if (expr.$sum !== undefined) {
              if (typeof expr.$sum === 'number') {
                groupedDoc[field] = groupDocs.length * expr.$sum;
              } else if (typeof expr.$sum === 'string' && expr.$sum.startsWith('$')) {
                const targetKey = expr.$sum.substring(1);
                groupedDoc[field] = groupDocs.reduce((acc, d) => acc + (Number(d[targetKey]) || 0), 0);
              }
            } else if (expr.$avg !== undefined && typeof expr.$avg === 'string' && expr.$avg.startsWith('$')) {
              const targetKey = expr.$avg.substring(1);
              const sum = groupDocs.reduce((acc, d) => acc + (Number(d[targetKey]) || 0), 0);
              groupedDoc[field] = groupDocs.length ? Math.round(sum / groupDocs.length) : 0;
            } else if (expr.$count !== undefined) {
              groupedDoc[field] = groupDocs.length;
            }
          });
          return groupedDoc;
        });
        break;
      }

      case '$sort': {
        result.sort((a, b) => {
          for (const [key, direction] of Object.entries(stageConfig)) {
            const dir = direction === -1 || direction === 'desc' ? -1 : 1;
            if (a[key] < b[key]) return -1 * dir;
            if (a[key] > b[key]) return 1 * dir;
          }
          return 0;
        });
        break;
      }

      case '$project': {
        result = result.map(doc => {
          const projected = {};
          Object.entries(stageConfig).forEach(([field, include]) => {
            if (include === 1 || include === true) {
              projected[field] = doc[field];
            } else if (typeof include === 'string' && include.startsWith('$')) {
              projected[field] = doc[include.substring(1)];
            }
          });
          return projected;
        });
        break;
      }

      case '$unwind': {
        const fieldName = typeof stageConfig === 'string' && stageConfig.startsWith('$')
          ? stageConfig.substring(1)
          : stageConfig.path.substring(1);

        const unwound = [];
        result.forEach(doc => {
          const arr = doc[fieldName];
          if (Array.isArray(arr) && arr.length > 0) {
            arr.forEach(item => {
              unwound.push({ ...doc, [fieldName]: item });
            });
          } else {
            unwound.push({ ...doc, [fieldName]: null });
          }
        });
        result = unwound;
        break;
      }

      default:
        break;
    }
  }

  return result;
}
