/* ============
 * Getters for the account module
 * ============
 *
 * The getters that are available on the
 * account module.
 */

function showLedger(state) {
    if (state.user && state.user.userType === 'vendor') {
        if (state.user && state.user.vendor) return state.user.vendor.showLedger
    }

    return false;
}

export default {
    getUser: state => state.user,
    getUserId: state => state.user.id,
    getUserRole: state => state.user.role,
    loggedInUser: state => state.user,
    loggedInUserId: state => state.user.id,
    getVendor: state => state.user.vendor,
    isSuperAdmin: state => state.user.role === 'superadmin',
    isVendor: state => state.user.userType === 'vendor',
    isViewOnly: state => state.user.role === 'view_only',
    isBD: state => state.user.role === 'bd',
    isCO: state => state.user.role === 'co',
    isSourcingRole: state => ['sourcing', 'coorporate_sourcing'].includes(state.user.sourcingType),
    isMDM: state => state.user.sourcingType === 'mdm',
    isSourcingHead: state => state.user.sourcingType === 'sourcing_head',
    isRegionalSourcing: state => state.user.sourcingType === 'sourcing',
    isSourcingTeam: state => state.user.sourcingType === 'sourcing',
    isCoorporateSourcingTeam: state => state.user.sourcingType === 'coorporate_sourcing',
    userIs: state => (...args) => args.includes(state.user.role),
    showVendorLedger: showLedger,
};
