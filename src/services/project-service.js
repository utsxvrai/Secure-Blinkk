const projectRepository = require('../repositories/project-repository');
const Project = require('../models/project');
const { NotFoundError } = require('../utils/errors');
const { logAction } = require('../utils/audit');

const createProject = async (name, description, organizationId, userId) => {
  const project = new Project({
    organizationId,
    name,
    description,
    owner: userId,
  });

  const createdProject = await projectRepository.create(project);

  // Log audit
  await logAction(userId, organizationId, 'PROJECT_CREATED', 'Project', {
    projectId: createdProject.id,
    projectName: createdProject.name,
  });

  return new Project(createdProject).getPublicData();
};

const getProjects = async (organizationId) => {
  const projects = await projectRepository.findByOrganization(organizationId);
  
  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    owner: project.owner,
    isActive: project.isActive,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }));
};

const getProjectById = async (projectId, organizationId) => {
  const project = await projectRepository.findById(projectId);
  
  if (!project || project.organizationId !== organizationId) {
    throw new NotFoundError('Project not found');
  }

  return new Project(project).getPublicData();
};

const updateProject = async (projectId, organizationId, userId, updates) => {
  const project = await projectRepository.findById(projectId);
  
  if (!project || project.organizationId !== organizationId) {
    throw new NotFoundError('Project not found');
  }

  const updatedProject = await projectRepository.update(projectId, updates);

  // Log audit
  await logAction(userId, organizationId, 'PROJECT_UPDATED', 'Project', {
    projectId,
    changes: updates,
  });

  return new Project(updatedProject).getPublicData();
};

const deleteProject = async (projectId, organizationId, userId) => {
  const project = await projectRepository.findById(projectId);
  
  if (!project || project.organizationId !== organizationId) {
    throw new NotFoundError('Project not found');
  }

  await projectRepository.delete(projectId);

  // Log audit
  await logAction(userId, organizationId, 'PROJECT_DELETED', 'Project', {
    projectId,
    projectName: project.name,
  });

  return { message: 'Project deleted successfully' };
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
